# EarnFlow — MongoDB + Vercel

## IMPORTANT Vercel setup
Upload the contents of this folder to the **root of your GitHub repository**. Do not put them inside another `earnflow/` folder unless you set Vercel Root Directory to that folder.

The API uses a Vercel catch-all function at `api/[...all].js`, so these routes work:
- `/api/health`
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/admin-login`
- `/api/tasks`
- `/api/me`
- `/api/submissions`
- `/api/admin/submissions`

Environment Variables in Vercel:
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_USER`
- `ADMIN_PASSWORD`

After adding/changing variables, Redeploy.

MongoDB Atlas must allow connections from your deployment (for initial testing, configure Network Access appropriately).

Local:
`npm install`
`npm start`

Admin demo: `admin` / `deoxy` (change for production).
