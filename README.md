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
