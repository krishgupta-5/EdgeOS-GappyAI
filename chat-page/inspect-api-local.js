require('dotenv').config({ path: '.env.local' });
// We can't easily mock auth() in a separate process for a Next.js route unless we set up the whole Next.js environment.
// BUT I can just look at `artifacts[data.type] = data;`
