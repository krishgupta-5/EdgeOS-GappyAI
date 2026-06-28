import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getFullUserData } from '@/lib/auth';
import { createOrUpdateUser } from '@/lib/firebase-admin';
import { getOrCreateQuota, deductTokens } from '@/lib/token-quota';

import { loadProjectState, saveAssistantMessage, saveUserMessage, saveSessionMetadata } from '@/lib/pipeline/FirestoreService';
import { buildConversationalContext } from '@/lib/chat/ContextManager';
import { classifyRequest } from '@/lib/chat/RequestClassifier';
import { analyzeImpact } from '@/lib/chat/ImpactAnalysis';
import { modifyArtifact } from '@/lib/pipeline/ArtifactController';
import type { ArtifactType } from '@/lib/pipeline/types';

function secureHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

function errorResponse(error: string, code: string, status: number): NextResponse {
  return secureHeaders(NextResponse.json({ error, code }, { status }));
}

export async function POST(req: Request) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const fullUserData = await getFullUserData();
    await createOrUpdateUser(userId, fullUserData);

    const quota = await getOrCreateQuota(userId);
    if (quota.exhausted || quota.tokensUsed >= quota.tokensLimit)
      return errorResponse('Daily token limit reached.', 'TOKEN_EXHAUSTED', 429);

    // ── Parse body ───────────────────────────────────────────────────────────
    let body: {
      prompt: string;
      sessionId: string;
      history: { role: string; content: string }[];
    };
    try {
      body = await req.json();
    } catch (error) {
      return errorResponse('Invalid JSON body', 'BAD_REQUEST', 400);
    }

    const { prompt, sessionId, history } = body;

    if (!prompt || !sessionId) {
      return errorResponse('Prompt and sessionId are required', 'MISSING_DATA', 400);
    }

    // ── API keys ─────────────────────────────────────────────────────────────
    const groqApiKey = process.env.GROQ_CHAT_API_KEY || process.env.GROQ_API_KEY;
    const groqModel = process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile';
    
    // We also need the standard Gemini API key for artifact modifications
    const fallbackApiKey = process.env.GROQ_API_KEY; // For ArtifactController backward compatibility
    
    if (!groqApiKey) return errorResponse('Server misconfiguration', 'MISSING_API_KEY', 500);

    // ── Load Project State ───────────────────────────────────────────────────
    const state = await loadProjectState(sessionId);
    if (!state) {
      return errorResponse('Session not found', 'NOT_FOUND', 404);
    }

    // ── Save User Message ────────────────────────────────────────────────────
    await saveUserMessage(sessionId, userId, prompt);

    // ── 1. Classification ────────────────────────────────────────────────────
    const classification = await classifyRequest(prompt, state, groqApiKey, groqModel);
    console.log(`[Conversation] Category: ${classification.category} - ${classification.explanation}`);

    // ── 2. Handle based on Category ──────────────────────────────────────────
    if (['Explain', 'General Project Question'].includes(classification.category)) {
      // ── Pure Conversation (No artifact changes) ──
      const messages = buildConversationalContext(state, prompt, history);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: groqModel,
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        return errorResponse('Failed to generate conversational response', 'GROQ_ERROR', 500);
      }

      const data = await response.json();
      const assistantReply = data.choices[0].message.content;

      await saveAssistantMessage(sessionId, userId, assistantReply);
      
      // Update conversational summary (naively appending for now)
      const newConvSummary = (state.conversationSummary || '') + `\nUser: ${prompt}\nSystem: ${assistantReply}\n`;
      await saveSessionMetadata(sessionId, userId, {
        conversationSummary: newConvSummary.slice(-2000), // Keep it bounded
        lastConversationAt: new Date().toISOString(),
      });

      return secureHeaders(NextResponse.json({
        content: assistantReply,
        category: classification.category,
        artifactsModified: []
      }));

    } else {
      // ── Modification Required ──
      // 1. Impact Analysis
      const impact = await analyzeImpact(prompt, state, groqApiKey, groqModel);
      console.log(`[Conversation] Affected artifacts: ${impact.affectedArtifacts.join(', ')}`);

      if (impact.affectedArtifacts.length === 0) {
        // Fallback if it found nothing
        const assistantReply = "I couldn't identify any specific project files that need to change based on your request. Could you be more specific about what you'd like to modify?";
        await saveAssistantMessage(sessionId, userId, assistantReply);
        return secureHeaders(NextResponse.json({
          content: assistantReply,
          category: classification.category,
          artifactsModified: []
        }));
      }

      // 2. Artifact Regeneration (via existing Gemini pipeline)
      let tokensUsed = 0;
      let configChanged = false;
      const failedArtifacts: { type: string; error: string }[] = [];
      const modifiedArtifacts: string[] = [];

      for (const artifactType of impact.affectedArtifacts) {
        try {
          const modifyRes = await modifyArtifact(
            artifactType as ArtifactType,
            state,
            prompt,
            fallbackApiKey!
          );

          if (modifyRes) {
             tokensUsed += modifyRes.tokensUsed;
             // If config was modified, yaml would be returned. Let's just assume we modified it successfully.
             if (artifactType === 'config') configChanged = true;
             modifiedArtifacts.push(artifactType);
          } else {
             failedArtifacts.push({ type: artifactType, error: 'Generation returned null.' });
          }
        } catch (err: any) {
          console.error(`Failed to modify ${artifactType}:`, err);
          failedArtifacts.push({ type: artifactType, error: err.message || String(err) });
        }
      }

      if (failedArtifacts.length > 0 && modifiedArtifacts.length === 0) {
        return errorResponse(
          `Failed to modify any artifacts. Errors: ${failedArtifacts.map(f => `${f.type} (${f.error})`).join(', ')}`,
          'MODIFY_FAILED',
          500
        );
      }

      // 3. Update Session State
      await saveSessionMetadata(sessionId, userId, {
        totalTokensUsed: state.totalTokensUsed + tokensUsed,
        lastConversationAt: new Date().toISOString(),
        pendingIntegrationUpdates: {
          github: !!state.githubUrl,
          notion: !!state.notionUrl,
          jira: !!state.jiraUrl
        }
      });

      // 4. Charge tokens
      if (tokensUsed > 0) {
        await deductTokens(userId, tokensUsed);
      }

      let summaryReply = `I have successfully modified the following artifacts based on your request:\n- ${modifiedArtifacts.join('\n- ')}\n\n${impact.reasonForChange}`;
      
      if (failedArtifacts.length > 0) {
        summaryReply += `\n\nHowever, I encountered errors modifying the following:\n${failedArtifacts.map(f => `- ${f.type}: ${f.error}`).join('\n')}`;
      }
      
      await saveAssistantMessage(sessionId, userId, summaryReply);

      return secureHeaders(NextResponse.json({
        content: summaryReply,
        category: classification.category,
        artifactsModified: modifiedArtifacts,
        configChanged
      }));
    }

  } catch (error) {
    console.error('Conversation error:', error);
    return errorResponse('Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
