# EarnFlow — MongoDB + Vercel fixed

This version uses a Vercel serverless entrypoint at `api/index.js`, with Express serving the frontend and API.

## Deploy
1. Push the contents of this folder to GitHub.
2. Import the repository into Vercel. Leave Root Directory as the repository root.
3. Vercel detects `api/index.js` automatically.
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_USER`
   - `ADMIN_PASSWORD`
5. Redeploy.

## Local
`npm install`
`node backend/server.js`

## Demo admin
Username: admin
Password: deoxy

Change the production password in Vercel environment variables. Never commit `.env`.

## Important
Use genuine feedback only; do not fabricate or automate reviews.

## If registration fails on Vercel
Make sure these Vercel Environment Variables are set for Production (and Preview if testing there):
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_USER`
- `ADMIN_PASSWORD`

In MongoDB Atlas, add the Vercel deployment network access as required by your security policy. For a quick test you can temporarily allow `0.0.0.0/0`, then tighten access for production.

Test `GET /api/health`. It should return `{"ok":true,"database":true}`.
