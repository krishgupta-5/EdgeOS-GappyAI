import { ProjectState } from '@/lib/pipeline/types';
import { GroqMessage } from '@/lib/pipeline/types';

/**
 * Builds a compact context for conversational mode.
 * We avoid sending the full project artifacts to keep tokens low.
 * We rely on projectSummary and artifactSummary from the state.
 */
export function buildConversationalContext(
  state: ProjectState,
  userMessage: string,
  history: { role: string; content: string }[] = []
): GroqMessage[] {
  const messages: GroqMessage[] = [];

  // Master System Prompt for Conversation
  let systemContent = `You are EdgeOS, an elite AI Software Architect. 
Your goal is to help the user refine, understand, and iterate on their project.
You have already generated the initial architecture and codebase.

CURRENT PROJECT CONTEXT:
`;

  if (state.projectDescription) {
    systemContent += `\nOriginal Request:\n${state.projectDescription}\n`;
  }

  if (state.projectSummary) {
    systemContent += `\nProject Summary:\n${state.projectSummary}\n`;
  }

  if (state.artifactSummary) {
    systemContent += `\nArtifact Summary:\n${state.artifactSummary}\n`;
  } else if (state.summaries) {
    systemContent += `\nArtifact Summaries:\n`;
    for (const [type, summary] of Object.entries(state.summaries)) {
      if (summary) {
        systemContent += `- [${type}]: ${summary}\n`;
      }
    }
  }

  if (state.conversationSummary) {
    systemContent += `\nRecent Conversation Summary:\n${state.conversationSummary}\n`;
  }

  systemContent += `
INSTRUCTIONS:
1. Stay strictly within the context of the current project.
2. If the user asks an unrelated question, politely decline and refocus them on the project.
3. Be concise, professional, and helpful.`;

  messages.push({ role: 'system', content: systemContent });

  // Append recent chat history (limit to last 10 messages for context window safety)
  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    messages.push({ 
      role: msg.role === 'user' ? 'user' : 'assistant', 
      content: msg.content 
    });
  }

  // Append the current user message
  messages.push({ role: 'user', content: userMessage });

  return messages;
}
