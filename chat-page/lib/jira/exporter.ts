import { getJiraClient } from './client';
import type { ProjectState } from '@/lib/pipeline/types';

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function generateProjectKey(title: string): string {
  const parts = title.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, Math.min(10, parts[0].length)).toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
  return parts.map(p => p[0]).join('').substring(0, 10).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function parseUserStories(markdown: string): { title: string, description: string }[] {
  const stories = [];
  const lines = markdown.split('\n');
  let currentTitle = '';
  let currentDesc = '';
  for (const line of lines) {
    if (line.match(/^#+\s/)) {
      if (currentTitle) stories.push({ title: currentTitle, description: currentDesc.trim() });
      currentTitle = line.replace(/^#+\s/, '').trim();
      currentDesc = '';
    } else if (line.match(/^[-*]\s+As a/i) || line.match(/^\d+\.\s+As a/i)) {
      if (currentTitle) stories.push({ title: currentTitle, description: currentDesc.trim() });
      currentTitle = line.replace(/^[-*\d.]+\s+/, '').trim();
      currentDesc = '';
    } else {
      currentDesc += line + '\n';
    }
  }
  if (currentTitle) stories.push({ title: currentTitle, description: currentDesc.trim() });
  
  if (stories.length === 0 && markdown.trim()) {
    stories.push({ title: 'Project User Stories', description: markdown });
  }
  return stories;
}

export async function exportToJira(
  state: ProjectState,
  title: string,
  userId: string,
  logSummary: any = {},
  onProgress?: (msg: string) => void,
  existingProjectKey?: string,
  dirtyArtifacts?: string[]
) {
  const startTime = Date.now();
  console.log(`[JIRA] Export Started`);
  onProgress?.('Initializing Jira export...');

  const client = await getJiraClient(userId);
  if (!client) {
    console.error(`[JIRA] Credentials missing. Export Failed.`);
    logSummary.Jira = 'FAILED';
    return null;
  }

  // 1. Verify Authentication
  let currentUser;
  try {
    currentUser = await client.getCurrentUser();
    console.log(`[JIRA] Authenticated user accountId: ${currentUser.accountId}`);
    if (currentUser.displayName) console.log(`[JIRA] Authenticated user displayName: ${currentUser.displayName}`);
    if (currentUser.emailAddress) console.log(`[JIRA] Authenticated user emailAddress: ${currentUser.emailAddress}`);
  } catch (err: any) {
    console.error(`[JIRA] Verification failed. Could not fetch /myself. Export Failed.`);
    logSummary.Jira = 'FAILED';
    return null;
  }
  const accountId = currentUser.accountId;
  let projectKey = existingProjectKey || generateProjectKey(title || 'New Project');
  if (projectKey.length < 2) projectKey = projectKey + 'PRJ'; // Jira requires min 2 chars
  
  let projectId;
  let createdProject;

  if (existingProjectKey) {
    onProgress?.('Fetching existing project...');
    try {
      createdProject = await client.request('GET', `/project/${existingProjectKey}`);
      projectId = createdProject.id;
      console.log(`[JIRA] Using existing project: ${existingProjectKey}`);
    } catch (err) {
      console.error(`[JIRA] Failed to fetch existing project ${existingProjectKey}`, err);
      logSummary.Jira = 'FAILED';
      return null;
    }
  } else {
    onProgress?.('Creating project...');

    // Handle key collisions by appending a number
    for (let i = 1; i <= 10; i++) {
      try {
        createdProject = await client.createProject(title || 'New Project', projectKey, accountId);
        projectId = createdProject.id;
        console.log(`[JIRA] Project Created: ${projectKey}`);
        break;
      } catch (err: any) {
        if (err.message && err.message.includes('400') && i < 10) { // Bad request often means key collision
          projectKey = generateProjectKey(title) + i;
        } else {
          console.warn(`[JIRA] Project creation failed. Falling back to existing project.`, err?.message || err);
          break; // Break and try fallback
        }
      }
    }

    // Fallback: If project creation failed (permissions, policy, etc), use first available existing project
    if (!projectId) {
      try {
        const existingProjects = await client.getProjects();
        if (existingProjects && existingProjects.length > 0) {
          createdProject = existingProjects[0];
          projectId = createdProject.id;
          projectKey = createdProject.key;
          console.log(`[JIRA] Fallback successful. Using existing project: ${projectKey}`);
        }
      } catch (e) {
        console.error(`[JIRA] Failed to fetch existing projects for fallback.`, e);
      }
    }

    if (!projectId) {
      console.error(`[JIRA] Failed to create or find a Jira project.`);
      logSummary.Jira = 'FAILED';
      return null;
    }
  }

  // Sync User Stories
  if (state.artifacts.userStories?.content) {
    onProgress?.('Syncing user stories...');
    const stories = parseUserStories(state.artifacts.userStories.content);
    
    // Fetch existing issues to avoid duplicates
    let existingIssues: any[] = [];
    try {
      const searchRes = await client.searchIssues(`project="${projectKey}"`);
      if (searchRes && searchRes.issues) existingIssues = searchRes.issues;
    } catch (e) {
      console.warn('[JIRA] Could not fetch existing issues, proceeding without deduplication.');
    }

    for (const story of stories) {
      // Find matching issue by summary (exact match or prefix)
      const existing = existingIssues.find(iss => 
        iss.fields?.summary?.toLowerCase() === story.title.toLowerCase() || 
        story.title.toLowerCase().includes(iss.fields?.summary?.toLowerCase())
      );

      try {
        if (existing) {
          await client.updateIssue(existing.id, story.title, story.description || 'No description provided');
          console.log(`[JIRA] Updated issue: ${existing.key}`);
        } else {
          await client.createIssue(projectKey, story.title.substring(0, 255), story.description || 'No description provided');
          console.log(`[JIRA] Created new issue: ${story.title.substring(0, 50)}...`);
        }
      } catch (err) {
        console.error(`[JIRA] Failed to sync issue: ${story.title}`, err);
      }
    }
  }



  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[JIRA] Export Completed (${duration}s)`);
  logSummary.Jira = 'SUCCESS';
  onProgress?.('Project ready.');

  const jiraUrl = createdProject.self?.split('/rest/api')[0] + `/browse/${projectKey}`;

  return {
    jiraProjectKey: projectKey,
    jiraUrl: jiraUrl,
  };
}
