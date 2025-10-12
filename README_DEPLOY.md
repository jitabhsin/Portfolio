# Deployment guide (GitHub + Vercel / Netlify)

This project is a Vite + React portfolio. The chatbot calls a serverless proxy endpoint at `/api/chat` which forwards requests to OpenRouter using a server-side API key stored in an environment variable `OPENROUTER_API_KEY`.

Follow these steps to host for free:

1) Push code to GitHub

```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

2) Deploy with Vercel (recommended)

- Create an account and connect your GitHub repo.
- In Project Settings → Environment Variables add:
  - Key: `OPENROUTER_API_KEY`
  - Value: <your-openrouter-api-key>
- Vercel will detect this as a static site with serverless functions. The `api/chat.js` file will be used as a serverless function.

3) Deploy with Netlify (alternative)

- Connect your GitHub repo to Netlify.
- In Site settings → Build & deploy → Environment add `OPENROUTER_API_KEY`.
- Ensure Netlify recognizes the `api/` folder as functions — Netlify will use `netlify/functions` by default; if needed, configure the Functions directory in Site settings or move the file to `netlify/functions/chat.js`.

4) Local testing

- Create a `.env` (local development only) with the following (do NOT commit this file):

```
OPENROUTER_API_KEY=sk-...yourkey...
```

- Run locally:

```powershell
npm install
npm run dev
```

Note: Vite exposes `import.meta.env` keys that start with `VITE_` to the client. Do NOT put secret keys there. Use the serverless proxy instead.

5) Troubleshooting

- If the chat returns 500, check the platform's environment variable is set and the function logs for errors.
- For Netlify, if your function path differs, update the fetch path in `src/chatbot.jsx` accordingly.

6) Final checklist

- [ ] Push repository to GitHub
- [ ] Set `OPENROUTER_API_KEY` on hosting provider
- [ ] Deploy and test the chat on the live site

If you'd like, I can also create a `.gitignore` entry for `.env` and create a small test script to validate the API route locally.
