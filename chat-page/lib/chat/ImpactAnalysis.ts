import { GroqMessage, ArtifactType, ProjectState } from '@/lib/pipeline/types';

export interface ImpactAnalysisResult {
  affectedArtifacts: ArtifactType[];
  reasonForChange: string;
}

/**
 * Analyzes the user's request using Groq to determine which artifacts need to be regenerated.
 */
export async function analyzeImpact(
  userMessage: string,
  state: ProjectState,
  apiKey: string,
  model: string
): Promise<ImpactAnalysisResult> {
  // Extract all existing artifacts to let Groq know what can be modified
  const existingArtifacts = Object.keys(state.artifacts).join(', ');

  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are an impact analysis expert for a software architecture AI.
A user has requested a modification to their project.
Your job is to determine WHICH specific artifacts must be regenerated to fulfill this request.

Available Artifacts in this project: ${existingArtifacts || 'config, markdown, db, apiDesign, folderStructure, docker, testingPlan, userStories, roadmap, deploymentGuide, costEstimation, projectTimeline, riskAnalysis, finalMarkdown'}

Current Project Context:
${state.projectSummary || state.projectDescription}

Respond strictly with a JSON object in the following format:
{
  "affectedArtifacts": ["config", "docker", "apiDesign"],
  "reasonForChange": "Brief explanation of why these artifacts are affected"
}

Rules:
1. ONLY list artifacts that truly need to change based on the request.
2. If the user explicitly asks to generate a specific artifact, include it.
3. If changing backend logic, usually 'apiDesign', 'folderStructure' or 'config' might change.
4. If changing DB, 'db' schema and 'apiDesign' might change.
5. Do not hallucinate artifact types not listed in Available Artifacts.`
    },
    {
      role: 'user',
      content: `Modification Request: ${userMessage}`
    }
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.1,
      max_tokens: 250,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Groq impact analysis failed:', err);
    return { affectedArtifacts: [], reasonForChange: 'Impact analysis API failed' };
  }

  const data = await response.json();
  try {
    const result = JSON.parse(data.choices[0].message.content);
    // Validate that the returned artifacts are valid types
    const validArtifacts: ArtifactType[] = [];
    const validTypes = ['config', 'markdown', 'db', 'apiDesign', 'folderStructure', 'docker', 'testingPlan', 'userStories', 'roadmap', 'deploymentGuide', 'costEstimation', 'projectTimeline', 'riskAnalysis', 'finalMarkdown'];
    
    for (const art of (result.affectedArtifacts || [])) {
      if (validTypes.includes(art)) {
        validArtifacts.push(art as ArtifactType);
      }
    }

    return {
      affectedArtifacts: validArtifacts,
      reasonForChange: result.reasonForChange || 'Requested modification'
    };
  } catch (e) {
    console.error('Failed to parse impact analysis JSON:', e);
    return { affectedArtifacts: [], reasonForChange: 'Parse error fallback' };
  }
}
