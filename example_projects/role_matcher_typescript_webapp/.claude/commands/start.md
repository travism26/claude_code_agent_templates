# Start Frontend and Backend Applications

## Instructions

This command starts both the backend and frontend development servers for the application.

### Prerequisites

Before running these commands, ensure:

1. Environment variables are configured:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   Then add your `OPENROUTER_API_KEY` to `backend/.env`
2. Dependencies are installed in both directories

### Startup Order

Run the commands in the `Run` section below in separate terminals (top to bottom).

## Run

cd backend && npm run dev
cd frontend && npm run dev
