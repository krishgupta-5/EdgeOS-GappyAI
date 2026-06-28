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
  const sessionId = 'mqxyn9qmqyff8p8cf'; // Replace with a recent session
  const artifactsSnapshot = await db.collection('sessions').doc(sessionId).collection('artifacts').get();
  
  const artifacts = {};
  artifactsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    artifacts[data.type] = data;
  });

  console.log("Keys:", Object.keys(artifacts));
  for (const key of Object.keys(artifacts)) {
    console.log(`${key}: content length = ${artifacts[key].content ? artifacts[key].content.length : 'MISSING'}`);
  }
}
run().catch(console.error);
