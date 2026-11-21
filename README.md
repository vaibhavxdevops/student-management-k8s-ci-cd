# Student Management App

React (Vite) frontend + Node/Express backend + external Postgres (e.g. Neon).

## Run locally

### 1. Backend
```bash
cd backend
cp .env.example .env     # then put your DATABASE_URL in .env
npm install
npm start                # http://localhost:5000
```
Check: http://localhost:5000/health should return {"status":"ok","db":"connected"}

### 2. Frontend
```bash
cd frontend
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm install
npm run dev              # http://localhost:5173
```

## API
| Method | Path                | Purpose        |
|--------|---------------------|----------------|
| GET    | /health             | health check   |
| GET    | /api/students       | list students  |
| POST   | /api/students       | add student    |
| PUT    | /api/students/:id   | update student |
| DELETE | /api/students/:id   | delete student |
