import { GroqMessage, GroqCallConfig, ProjectState } from '@/lib/pipeline/types';

export type RequestCategory = 
  | 'Explain' 
  | 'Modify' 
  | 'Add Feature' 
  | 'Remove Feature' 
  | 'Generate Artifact' 
  | 'Communication'
  | 'Scheduling'
  | 'General Project Question';

export interface ClassificationResult {
  category: RequestCategory;
  explanation: string;
}

/**
 * Classifies a user request using Groq to determine intent.
 * Used to decide if artifacts need to be regenerated (by Gemini) 
 * or if it's just a conversation response (by Groq).
 */
export async function classifyRequest(
  userMessage: string,
  state: ProjectState,
  apiKey: string,
  model: string
): Promise<ClassificationResult> {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are an intent classifier for a software architecture AI.
Analyze the user's message and classify it into EXACTLY ONE of the following categories:
- Explain (User is asking how something works or why a choice was made)
- Modify (User wants to change an existing technology, architecture, or code)
- Add Feature (User wants to add a new capability or module)
- Remove Feature (User wants to remove a capability)
- Generate Artifact (User explicitly asks to generate a new document or code file)
- Communication (User wants to draft, edit, or send an email/communication)
- Scheduling (User wants to plan, schedule, or move a calendar meeting/event)
- General Project Question (User asks a generic question about the project status or metadata)

Current Project Status:
${state.projectSummary || state.projectDescription}

CRITICAL RULES:
1. If the user message contains "[System Context: Current Meeting Draft", the category MUST be "Scheduling".
2. If the user message contains "[System Context: Current Email Draft", the category MUST be "Communication".
3. If the user message contains "Current Draft:", determine if it's an email (Communication) or meeting (Scheduling) and route accordingly. DO NOT route to Modify.

Respond strictly with a JSON object in the following format:
{
  "category": "Explain | Modify | Add Feature | Remove Feature | Generate Artifact | Communication | Scheduling | General Project Question",
  "explanation": "Brief reasoning for this classification"
}`
    },
    {
      role: 'user',
      content: userMessage
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
      max_tokens: 150,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Groq classification failed:', err);
    // Fallback classification if the API fails
    return { category: 'Explain', explanation: 'Fallback due to API error' };
  }

  const data = await response.json();
  try {
    const result = JSON.parse(data.choices[0].message.content);
    return {
      category: result.category as RequestCategory,
      explanation: result.explanation
    };
  } catch (e) {
    console.error('Failed to parse classification JSON:', e);
    return { category: 'Explain', explanation: 'Parse error fallback' };
  }
}
