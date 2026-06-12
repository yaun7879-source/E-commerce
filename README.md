# Mahasu E-commerce

This project has been prepared for production deployment on MilesWeb hosting with a Node.js backend and a Vite React frontend.

## Project structure
- backend/: Express API server
- my-app/: React frontend built with Vite

## Required environment variables

### Backend
Create a backend/.env file from backend/.env.example and set:
- NODE_ENV=production
- PORT=5001
- HOST=0.0.0.0
- SESSION_SECRET
- JWT_SECRET
- FRONTEND_URL
- DB_HOST / DB_USER / DB_PASSWORD / DB_NAME / DB_PORT
- RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET

### Frontend
Create a my-app/.env file from my-app/.env.example and set:
- VITE_API_URL=https://your-domain.com/api
- VITE_API_BASE_URL=https://your-domain.com/api

## Production build

### Backend
```bash
cd backend
npm install
npm run start:prod
```

### Frontend
```bash
cd my-app
npm install
npm run build:prod
```

## MilesWeb deployment notes
- Upload the backend files to a Node.js app root or a subfolder.
- Run the backend with PM2:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```
- If the frontend and backend are hosted together, the backend serves the built frontend from the my-app/dist folder.
- Ensure HTTPS is enabled through the hosting panel and configure your domain to point to the app.

## Security notes
- Never commit .env files.
- Use strong secrets and HTTPS in production.
- Keep cookies secure and HttpOnly.
