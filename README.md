# Bharat Jeevan AI

Vercel-ready citizen and family intelligence prototype.

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000

## Vercel

Import this repository into Vercel. The included `vercel.json` routes requests through `api/index.js` and the Express app serves `public/index.html` plus `/resources/*.json`.

The site works without an API key using the built-in offline analysis. To enable the optional OpenAI backend, add `OPENAI_API_KEY` in Vercel Project Settings → Environment Variables. Do not commit `.env` or a real API key.

## Important

The scheme/resource catalogue is a prototype reference layer. It does not make official eligibility decisions. Verify live requirements on official government portals.
