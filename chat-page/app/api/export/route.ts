import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase-admin';
import * as firestoreService from '@/lib/pipeline/FirestoreService';
import { getOrCreateProjectState } from '@/lib/pipeline/ArtifactController';
import { exportToNotion } from '@/lib/notion/exporter';
import { exportToGithub } from '@/lib/github/exporter';
import { exportToJira } from '@/lib/jira/exporter';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const body = await req.json();
    const platform = body.platform;
    const sessionId = body.sessionId;

    if (!platform || !sessionId) {
      return NextResponse.json({ error: 'Missing platform or sessionId' }, { status: 400 });
    }

    const state = await getOrCreateProjectState(sessionId, userId, '');
    const userRef = db.collection('user_integrations').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const title = state.title || 'New Project';
    const logSummary: any = {};
    let exportData: any = null;

    if (platform === 'github') {
      const githubData = userData?.github;
      if (!githubData || !githubData.accessToken) {
        return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
      }

      const githubStartT = Date.now();
      await firestoreService.saveEvent(sessionId, { type: 'EXPORT_STARTED', source: 'github', message: 'Creating GitHub repository...' });
      
      exportData = await exportToGithub(
        state,
        title,
        githubData.accessToken,
        githubData.repoVisibility === 'private',
        logSummary,
        (msg: string) => firestoreService.saveEvent(sessionId, { type: 'EXPORT_PROGRESS', source: 'github', message: msg })
      );

      if (exportData) {
        await firestoreService.saveEvent(sessionId, { type: 'EXPORT_COMPLETED', source: 'github', message: 'GitHub export complete', durationMs: Date.now() - githubStartT });
        await firestoreService.saveSessionMetadata(sessionId, userId, {
          githubUrl: exportData.githubUrl,
          githubRepository: exportData.githubRepository,
          githubExportStatus: 'SUCCESS'
        });
      } else {
        await firestoreService.saveEvent(sessionId, { type: 'EXPORT_FAILED', source: 'github', message: 'GitHub export failed', durationMs: Date.now() - githubStartT });
        await firestoreService.saveSessionMetadata(sessionId, userId, { githubExportStatus: 'FAILED' });
        return NextResponse.json({ error: 'GitHub export failed' }, { status: 500 });
      }
    } 
    else if (platform === 'jira') {
      const jiraData = userData?.jira;
      if (!jiraData || !jiraData.accessToken) {
        return NextResponse.json({ error: 'Jira not connected' }, { status: 400 });
      }

      const jiraStartT = Date.now();
      await firestoreService.saveEvent(sessionId, { type: 'EXPORT_STARTED', source: 'jira', message: 'Creating Jira project...' });

      exportData = await exportToJira(
        state,
        title,
        userId,
        logSummary,
        (msg: string) => firestoreService.saveEvent(sessionId, { type: 'EXPORT_PROGRESS', source: 'jira', message: msg })
      );

      if (exportData) {
        await firestoreService.saveEvent(sessionId, { type: 'EXPORT_COMPLETED', source: 'jira', message: 'Jira export complete', durationMs: Date.now() - jiraStartT });
        await firestoreService.saveSessionMetadata(sessionId, userId, {
          jiraUrl: exportData.jiraUrl,
          jiraProjectKey: exportData.jiraProjectKey,
          jiraExportStatus: 'SUCCESS'
        });
      } else {
        await firestoreService.saveEvent(sessionId, { type: 'EXPORT_FAILED', source: 'jira', message: 'Jira export failed', durationMs: Date.now() - jiraStartT });
        await firestoreService.saveSessionMetadata(sessionId, userId, { jiraExportStatus: 'FAILED' });
        return NextResponse.json({ error: 'Jira export failed' }, { status: 500 });
      }
    }
    else if (platform === 'notion') {
      const notionData = userData?.notion;
      if (!notionData || !notionData.accessToken || !notionData.defaultParentPageId) {
        return NextResponse.json({ error: 'Notion not connected or missing parent page' }, { status: 400 });
      }

      const notionStartT = Date.now();
      await firestoreService.saveEvent(sessionId, { type: 'EXPORT_STARTED', source: 'notion', message: 'Exporting to Notion...' });

      try {
        exportData = await exportToNotion(
          state,
          title,
          notionData.accessToken,
          notionData.defaultParentPageId,
          logSummary,
          (msg: string) => firestoreService.saveEvent(sessionId, { type: 'EXPORT_PROGRESS', source: 'notion', message: msg })
        );

        if (exportData) {
          await firestoreService.saveEvent(sessionId, { type: 'EXPORT_COMPLETED', source: 'notion', message: 'Notion export complete', durationMs: Date.now() - notionStartT });
          await firestoreService.saveSessionMetadata(sessionId, userId, {
            notionUrl: exportData.notionUrl,
            notionPageId: exportData.notionPageId,
            exportStatus: 'SUCCESS'
          });
        } else {
          throw new Error('Notion export returned null');
        }
      } catch (err: any) {
        await firestoreService.saveEvent(sessionId, { type: 'EXPORT_FAILED', source: 'notion', message: 'Notion export failed', durationMs: Date.now() - notionStartT });
        await firestoreService.saveSessionMetadata(sessionId, userId, { exportStatus: 'FAILED' });
        
        if (err.message === 'PARENT_PAGE_NOT_FOUND') {
          await userRef.set({
            notion: { defaultParentPageId: null, updatedAt: new Date().toISOString() }
          }, { merge: true });
        }
        return NextResponse.json({ error: 'Notion export failed' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    return NextResponse.json({ success: true, exportData });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
