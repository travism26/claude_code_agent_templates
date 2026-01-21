# Start Application

## Instructions

This command starts the TypeScript full-stack application (Express backend + Next.js frontend) in development mode.

### Prerequisites

Before running these commands, ensure:

1. Node.js dependencies are installed: `npm install` in both `backend/` and `frontend/` directories
2. Environment variables are configured in `.env` files
3. Database is set up and migrations are run: `cd backend && npm run migrate:dev`

### Starting the Application

The application consists of two parts that need to run simultaneously:

## Backend (Express + TypeScript)

```bash
# Start the backend server (runs on port 3000 by default)
cd backend && npm run dev
```

The backend provides:
- REST API endpoints at `http://localhost:3000/api`
- Health check at `http://localhost:3000/api/health`
- SQLite database with migrations

## Frontend (Next.js + React)

```bash
# Start the frontend dev server (runs on port 3001 by default)
cd frontend && npm run dev
```

The frontend provides:
- Next.js application at `http://localhost:3001`
- React components with shadcn/ui
- TypeScript type safety

## Running Both Services

To run both services simultaneously, use two terminal windows or run in background:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Or run backend in background:

```bash
# Start backend in background
cd backend && npm run dev > /tmp/backend.log 2>&1 &

# Start frontend in foreground
cd frontend && npm run dev
```

## Verify Application is Running

```bash
# Check backend health
curl -s http://localhost:3000/api/health

# Check frontend (should return HTML)
curl -s http://localhost:3001 | head -20
```
