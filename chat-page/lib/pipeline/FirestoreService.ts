/**
 * lib/pipeline/FirestoreService.ts
 * Consolidated Firestore operations for the pipeline.
 *
 * All Firestore reads/writes go through this module.
 * Replaces: saveArtifact(), saveAssistantMessage(), saveSessionMetadata(),
 * saveUserMessage(), and memoryStore duplicate writes.
 */

import { db } from '@/lib/firebase-admin';
import type {
  ArtifactType,
  ProjectState,
  GeneratedArtifact,
  ArtifactMetadata,
  ProgressEvent,
} from './types';

// ─────────────────────────────────────────────
// Project State persistence
// ─────────────────────────────────────────────

/**
 * Load project state from Firestore.
 * Returns null if no session exists.
 */
export async function loadProjectState(
  sessionId: string,
): Promise<ProjectState | null> {
  try {
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    if (!sessionDoc.exists) return null;

    const sessionData = sessionDoc.data()!;

    // Load all artifacts
    const artifactSnap = await db
      .collection('sessions')
      .doc(sessionId)
      .collection('artifacts')
      .get();

    const artifacts: Partial<Record<ArtifactType, GeneratedArtifact>> = {};
    const summaries: Partial<Record<ArtifactType, string>> = {};

    for (const doc of artifactSnap.docs) {
      const data = doc.data();
      const type = (data.type ?? doc.id) as ArtifactType;

      // Support both old format (type field) and new format (doc ID = type)
      if (data.content) {
        artifacts[type] = {
          content: data.content,
          summary: data.summary ?? '',
          metadata: data.metadata ?? createDefaultMetadata(type),
          structuredData: data.structuredData,
        };
        if (data.summary) {
          summaries[type] = data.summary;
        }
      }
    }

    return {
      sessionId,
      userId: sessionData.userId ?? '',
      title: sessionData.title,
      projectDescription: sessionData.projectDescription ?? '',
      artifacts,
      summaries,
      status: sessionData.status ?? 'idle',
      createdAt: sessionData.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      updatedAt: sessionData.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      totalTokensUsed: sessionData.totalTokensUsed ?? 0,
      errors: sessionData.errors ?? [],
    };
  } catch (err) {
    console.error(
      JSON.stringify({
        level: 'error',
        msg: 'Failed to load project state',
        sessionId,
        err: String(err),
        ts: Date.now(),
      }),
    );
    return null;
  }
}

/**
 * Save an artifact to Firestore.
 * Uses the artifact type as the document ID for O(1) lookups.
 */
export async function saveArtifact(
  sessionId: string,
  userId: string,
  artifactType: ArtifactType | string,
  content: string,
  summary?: string,
  metadata?: ArtifactMetadata,
  structuredData?: any,
): Promise<void> {
  const docData: Record<string, any> = {
    type: artifactType,
    content,
    userId,
    updatedAt: new Date(),
  };

  if (summary) docData.summary = summary;
  if (metadata) docData.metadata = metadata;
  if (structuredData !== undefined) docData.structuredData = structuredData;

  // Write with deterministic ID (artifact type) for O(1) reads
  await db
    .collection('sessions')
    .doc(sessionId)
    .collection('artifacts')
    .doc(artifactType)
    .set(docData, { merge: true });

  // Also write with auto-ID for backward compatibility with existing queries
  await db
    .collection('sessions')
    .doc(sessionId)
    .collection('artifacts')
    .add({ ...docData, createdAt: new Date() });
}

/**
 * Save a user message to Firestore.
 */
export async function saveUserMessage(
  sessionId: string,
  userId: string,
  content: string,
): Promise<void> {
  await db
    .collection('sessions')
    .doc(sessionId)
    .collection('messages')
    .add({ role: 'user', content, userId, createdAt: new Date() });
}

/**
 * Save an assistant message to Firestore.
 * Unlike the old implementation, this stores a SHORT display message,
 * not the full artifact JSON.
 */
export async function saveAssistantMessage(
  sessionId: string,
  userId: string,
  content: string,
  artifactType?: string,
): Promise<void> {
  await db
    .collection('sessions')
    .doc(sessionId)
    .collection('messages')
    .add({
      role: 'assistant',
      content,
      userId,
      ...(artifactType && { artifactType }),
      createdAt: new Date(),
    });
}

/**
 * Save/update session metadata.
 */
export async function saveSessionMetadata(
  sessionId: string,
  userId: string,
  data: {
    title?: string;
    projectDescription?: string;
    status?: string;
    totalTokensUsed?: number;
    notionUrl?: string;
    notionPageId?: string;
    exportStatus?: string;
    githubUrl?: string;
    githubRepository?: string;
    githubExportStatus?: string;
    jiraUrl?: string;
    jiraProjectKey?: string;
    jiraExportStatus?: string;
  },
): Promise<void> {
  const docData: Record<string, any> = {
    userId,
    updatedAt: new Date(),
  };

  if (data.title) docData.title = data.title;
  if (data.projectDescription) docData.projectDescription = data.projectDescription;
  if (data.status) docData.status = data.status;
  if (data.totalTokensUsed !== undefined) docData.totalTokensUsed = data.totalTokensUsed;
  if (data.notionUrl) docData.notionUrl = data.notionUrl;
  if (data.notionPageId) docData.notionPageId = data.notionPageId;
  if (data.exportStatus) docData.exportStatus = data.exportStatus;
  if (data.githubUrl) docData.githubUrl = data.githubUrl;
  if (data.githubRepository) docData.githubRepository = data.githubRepository;
  if (data.githubExportStatus) docData.githubExportStatus = data.githubExportStatus;
  if (data.jiraUrl) docData.jiraUrl = data.jiraUrl;
  if (data.jiraProjectKey) docData.jiraProjectKey = data.jiraProjectKey;
  if (data.jiraExportStatus) docData.jiraExportStatus = data.jiraExportStatus;

  await db
    .collection('sessions')
    .doc(sessionId)
    .set(docData, { merge: true });
}

/**
 * Load the config artifact for session rehydration.
 * Replaces the 3-level rehydration hack in route.ts.
 */
export async function loadConfigArtifact(
  sessionId: string,
): Promise<string | null> {
  try {
    // Try deterministic ID first (new format)
    const deterministicDoc = await db
      .collection('sessions')
      .doc(sessionId)
      .collection('artifacts')
      .doc('config')
      .get();

    if (deterministicDoc.exists) {
      return deterministicDoc.data()?.content ?? null;
    }

    // Fallback: query by type field (old format)
    const snap = await db
      .collection('sessions')
      .doc(sessionId)
      .collection('artifacts')
      .where('type', '==', 'config')
      .get();

    if (!snap.empty) {
      // Get the latest one
      const latest = snap.docs
        .map((d) => ({ content: d.data().content, time: d.data().createdAt?.toDate?.()?.getTime() ?? 0 }))
        .sort((a, b) => b.time - a.time)[0];
      return latest?.content ?? null;
    }

    return null;
  } catch (err) {
    console.error(
      JSON.stringify({
        level: 'error',
        msg: 'Failed to load config artifact',
        sessionId,
        err: String(err),
        ts: Date.now(),
      }),
    );
    return null;
  }
}

/**
 * Load the original user prompt from the first message.
 * Used for config auto-regeneration.
 */
export async function loadOriginalPrompt(
  sessionId: string,
): Promise<string | null> {
  try {
    // Check session-level projectDescription first
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    if (sessionDoc.exists) {
      const desc = sessionDoc.data()?.projectDescription;
      if (desc && typeof desc === 'string' && desc.length >= 5) {
        return desc;
      }
    }

    // Fallback: find the first user message
    const msgSnap = await db
      .collection('sessions')
      .doc(sessionId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .limit(5)
      .get();

    for (const doc of msgSnap.docs) {
      const data = doc.data();
      if (data.role === 'user' && data.content && data.content.length >= 5) {
        return data.content;
      }
    }

    return null;
  } catch (err) {
    console.error(
      JSON.stringify({
        level: 'error',
        msg: 'Failed to load original prompt',
        sessionId,
        err: String(err),
        ts: Date.now(),
      }),
    );
    return null;
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function createDefaultMetadata(artifactType: ArtifactType | string): ArtifactMetadata {
  return {
    generationId: `legacy-${Date.now()}`,
    artifactType: artifactType as ArtifactType,
    model: 'unknown',
    generatedAt: new Date().toISOString(),
    durationMs: 0,
    tokens: { prompt: 0, completion: 0, total: 0 },
    dependenciesUsed: [],
    dependenciesMissing: [],
    mode: 'generate',
    version: 1,
    contentHash: '',
    validationPassed: true,
    validationWarnings: [],
    contextTokens: 0,
    retryCount: 0,
  };
}

// ─────────────────────────────────────────────
// Event Streams
// ─────────────────────────────────────────────

/**
 * Save a real-time progress event for SSE timelines.
 */
export async function saveEvent(
  sessionId: string,
  event: Omit<ProgressEvent, 'timestamp'>
): Promise<void> {
  try {
    const docRef = db.collection('sessions').doc(sessionId).collection('events').doc();
    await docRef.set({
      id: docRef.id,
      ...event,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(JSON.stringify({
      level: 'error',
      msg: 'Failed to save progress event',
      sessionId,
      err: String(err),
      ts: Date.now()
    }));
  }
}

