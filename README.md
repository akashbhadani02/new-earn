# EarnFlow MongoDB

GitHub/Vercel-ready Express + MongoDB/Mongoose starter.

## Run
1. Create a MongoDB Atlas database.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
3. `cd backend && npm install`
4. `node server.js`
5. Open http://localhost:3000

Admin demo:
username: admin
password: deoxy

For production, change the admin password and JWT secret in environment variables. Never commit `.env`.

## Important
Wallet credit is performed only by the authenticated admin approval endpoint. Use the app for genuine product feedback; do not automate or fabricate reviews.
