const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API key');
    return;
  }
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!res.ok) {
    console.log('Error:', await res.text());
  } else {
    const data = await res.json();
    console.log('Available models:');
    data.models.filter(m => m.supportedGenerationMethods.includes('generateContent') && m.name.includes('flash')).forEach(m => {
      console.log(m.name);
    });
  }
}

run();
