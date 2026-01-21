AI Task Prioritizer

A smart backend + small frontend that prioritizes tasks using rules + LLM.

🎯 Primary Features

1. Task CRUD

- title
- description
- dueDate
- effort (1–5)
- importance (1–5)
- category
- status

2. Priority Score Calculation

Rules-based scoring:

- priority = importance*2 + effort*(-1) + deadlineWeight + categoryWeight

3. AI Enhancement

Endpoint:
POST /tasks/ai-prioritize
Takes the list of tasks
Asks LLM to:

- Re-rank tasks
- Justify ranks
- Suggest missing tasks
- Identify risks

4. Analytics Endpoints

- Count by category
- Overdue tasks
- Today’s tasks
- Effort distribution

5. Audit Logs

- Every create/update/delete saved as audit record.

6. Simple Frontend (Next.js or React)

- Task table
- Create task modal
- Drag/drop ordering
- “AI Prioritize” button (shows results in modal)
- Sidebar with analytics
- Color-coded priority badges

## ⚙️ Tech Stack

Backend (Node.js + TypeScript)

Express
SQLite
Zod validation
Jest testing
OpenAPI docs
Dockerfile
Frontend
Next.js (recommended)
shadcn/ui
React Query
Recharts for analytics
