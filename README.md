# EarnFlow — Vercel + MongoDB

## Deploy
1. Put the contents of this folder in the GitHub repository root.
2. Import the repository into Vercel. Leave Root Directory as `./`.
3. Add these Vercel Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD`.
4. Redeploy.
5. Test `https://YOUR-DOMAIN/api/health` and expect `{ "ok": true, "database": true }`.

Admin demo credentials: `admin` / `deoxy` (change in production).

Wallet is credited only after an authenticated admin approval. Reviews and proof should be genuine.
