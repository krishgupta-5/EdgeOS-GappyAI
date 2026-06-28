const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore();

async function run() {
  const sessions = await db.collection('sessions').orderBy('updatedAt', 'desc').limit(1).get();
  for (const session of sessions.docs) {
    console.log("Session:", session.id);
    const artifacts = await db.collection('sessions').doc(session.id).collection('artifacts').get();
    for (const doc of artifacts.docs) {
      const data = doc.data();
      console.log(`Doc ID: ${doc.id}, Type: ${data.type}, Content: ${data.content ? data.content.substring(0, 20) : 'MISSING'}`);
    }
  }
}
run().catch(console.error);
