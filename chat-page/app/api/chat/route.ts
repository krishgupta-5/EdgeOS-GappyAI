import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getFullUserData } from '@/lib/auth';
import { createOrUpdateUser, db } from '@/lib/firebase-admin';
import { getOrCreateQuota, deductTokens } from '@/lib/token-quota';

import { loadProjectState, saveAssistantMessage, saveUserMessage, saveSessionMetadata, saveEvent } from '@/lib/pipeline/FirestoreService';
import { buildConversationalContext } from '@/lib/chat/ContextManager';
import { classifyRequest } from '@/lib/chat/RequestClassifier';
import { analyzeImpact } from '@/lib/chat/ImpactAnalysis';
import { modifyArtifact } from '@/lib/pipeline/ArtifactController';
import { callGroqRaw, createCallConfig } from '@/lib/pipeline/GroqClient';
import { type ArtifactType, ARTIFACT_DEPENDENCY_MAP } from '@/lib/pipeline/types';



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

    } else if (classification.category === 'Communication' || classification.category === 'Scheduling') {
      const isEmail = classification.category === 'Communication';
      const promptContext = `
You are an AI Executive Assistant. The user wants to ${isEmail ? 'draft or edit an email' : 'schedule or edit a calendar meeting'}.
Current Project Status: ${state.projectSummary || ''}
Timeline: ${state.artifacts['projectTimeline']?.content || ''}
Roadmap: ${state.artifacts['roadmap']?.content || ''}
GitHub: ${state.githubUrl || ''}

User Request: "${prompt}"

If the user request contains "[System Context: Current ... Draft: {...}]", you MUST treat that JSON as the current draft and ONLY apply the user's requested modifications to it, keeping the rest of the draft intact. If no draft is provided, generate a new one.

Generate a draft of the ${isEmail ? 'email' : 'meeting'}.
Respond ONLY with a JSON object. Do not include markdown formatting or extra text.
CRITICAL RULE: If the user does not provide a FULL, valid email address for the recipient or guests, DO NOT hallucinate one (e.g., do NOT use @example.com). Leave the email field blank, and use the "assistantMessage" field to politely ask the user for the missing email address.

${isEmail ? `
Format:
{
  "assistantMessage": "Optional custom message for the user, especially if you need to ask for a valid email address.",
  "recipient": "email@domain.com (Leave empty string if not explicitly provided)",
  "subject": "Email Subject",
  "body": "The body of the email. Do not use markdown."
}
` : `
Format:
{
  "assistantMessage": "Optional custom message for the user, especially if you need to ask for valid guest email addresses.",
  "title": "Meeting Title",
  "date": "YYYY-MM-DD",
  "time": "HH:MM (24-hour)",
  "duration": 60,
  "guests": ["email@domain.com (Leave empty array if not explicitly provided)"],
  "agenda": "Meeting agenda",
  "description": "Meeting description"
}
`}
`;

      const groqKey = process.env.GROQ_API_KEY;
      if (!groqKey) return errorResponse('GROQ_API_KEY is not set', 'MISSING_API_KEY', 500);

      const config = createCallConfig(groqKey, 1024, 0.2);
      const res = await callGroqRaw(
        config,
        [{ role: 'user', content: promptContext }],
        'GenerateDraft'
      );

      if (!res || !res.content) {
        return errorResponse('Failed to generate draft', 'GROQ_ERROR', 500);
      }

      const rawOutput = res.content;

      let parsed: any;
      try {
        const cleanedOutput = rawOutput.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        parsed = JSON.parse(cleanedOutput);
      } catch (e) {
        return errorResponse('Failed to parse AI output', 'PARSE_ERROR', 500);
      }

      let emailPreview, meetingPreview;
      if (isEmail) {
        emailPreview = {
          ...parsed,
          status: 'preview'
        };
      } else {
        meetingPreview = {
          ...parsed,
          status: 'preview'
        };
      }

      const defaultReply = isEmail
        ? "I've prepared an email based on your request. Review it below. You can edit any field manually or ask me to refine it before sending."
        : "I've prepared the meeting details. Review or edit them below before scheduling.";

      const assistantReply = parsed.assistantMessage || defaultReply;

      const messageId = await saveAssistantMessage(sessionId, userId, assistantReply, undefined, emailPreview, meetingPreview);

      const newConvSummary = (state.conversationSummary || '') + `\nUser: ${prompt}\nSystem: ${assistantReply}\n`;
      await saveSessionMetadata(sessionId, userId, {
        conversationSummary: newConvSummary.slice(-2000),
        lastConversationAt: new Date().toISOString(),
      });

      return secureHeaders(NextResponse.json({
        id: messageId,
        content: assistantReply,
        category: classification.category,
        artifactsModified: [],
        emailPreview,
        meetingPreview
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

      // 3. Compute dirty integrations based on dependency map
      const dirtyIntegrations = new Set<string>();
      modifiedArtifacts.forEach((artifact) => {
        const dependentIntegrations = ARTIFACT_DEPENDENCY_MAP[artifact as ArtifactType] || [];
        dependentIntegrations.forEach((integration) => dirtyIntegrations.add(integration));
      });

      const isGithubDirty = dirtyIntegrations.has('github');
      const isJiraDirty = dirtyIntegrations.has('jira');
      const isNotionDirty = dirtyIntegrations.has('notion');

      // Update Session State
      await saveSessionMetadata(sessionId, userId, {
        totalTokensUsed: state.totalTokensUsed + tokensUsed,
        lastConversationAt: new Date().toISOString(),
        pendingIntegrationUpdates: {
          github: !!state.githubUrl,
          notion: !!state.notionUrl,
          jira: !!state.jiraUrl
        },
        // Only set dirty if the platform was already exported
        githubDirty: isGithubDirty && state.githubExported ? true : state.githubDirty,
        jiraDirty: isJiraDirty && state.jiraExported ? true : state.jiraDirty,
        notionDirty: isNotionDirty && state.notionExported ? true : state.notionDirty,
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
