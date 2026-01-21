# Troubleshoot

Systematically troubleshoot an issue using structured debugging, log analysis, and root cause investigation. Delegates to specialized commands for fixes.

## Variables

issue_description: $1

## Instructions

1. **Understand the Issue**
   - Clarify the problem symptoms, affected components, and user impact
   - Identify when the issue started occurring
   - Determine if this is a regression or new issue

2. **Check Application Health**
   - Verify backend server is running: `lsof -ti:3000`
   - Verify database connection: `psql -U postgres MY_APP -c "SELECT 1;"`
   - Check Redis connection (if applicable): `redis-cli ping`
   - Review recent changes: `git log --oneline -10`
   - Check git status for uncommitted changes: `git status`

3. **Search Relevant Logs**
   - IMPORTANT: Use the `/search_logs` command to analyze logs systematically
   - Read `.claude/commands/search_logs.md` for guidance on log searching
   - Common searches:
     - Recent errors: `/search_logs --level error --since 1h`
     - Trace specific request: `/search_logs --correlation-id <id>`
     - Service-specific: `/search_logs --service worker --level error`
   - Document correlation IDs, error patterns, and timestamps

4. **Analyze the Codebase**
   - Read `.claude/commands/conditional_docs.md` to identify relevant documentation
   - Based on the issue type, read the documentation that matches your conditions
   - Locate affected components using Grep/Glob tools
   - Review recent changes to those files: `git log --oneline <file-path> -5`

5. **Reproduce the Issue**
   - Identify the exact steps to reproduce the problem
   - Try to reproduce locally following those steps
   - Document what happens vs. what should happen
   - Capture any error messages, stack traces, or correlation IDs

6. **Root Cause Analysis**
   - Analyze the evidence from logs, code review, and reproduction
   - Identify the root cause (not just symptoms)
   - Classify the issue type:
     - **Bug**: Broken functionality, error in code logic
     - **Configuration**: Wrong settings, environment variables
     - **Data**: Database state, migration issue
     - **Chore**: Technical debt, refactoring needed
     - **Feature Gap**: Missing functionality
     - **Infrastructure**: External service, dependency issue

7. **Determine Fix Strategy**

   **Option A: Simple Fix (immediate)**
   - If the fix is trivial (typo, config change, one-liner)
   - Implement the minimal change directly
   - Validate with relevant tests
   - Skip to step 9 (Validation)

   **Option B: Complex Fix (delegate to specialized command)**
   - If the issue requires planning or multiple changes
   - Based on issue classification, use the appropriate command:
     - **For bugs**: Use `/bug` command to create a bug fix plan
     - **For refactoring/improvements**: Use `/chore` command
     - **For missing functionality**: Use `/feature` command
   - These commands will create a plan in `specs/` directory
   - Then use `/implement <plan-file>` to execute the plan

8. **Fix or Create Plan**

   **If Simple Fix:**
   - Make minimal, targeted changes
   - Document what was changed and why

   **If Complex Fix:**
   - Execute the appropriate planning command:
     ```bash
     /bug <issue-description>
     # or
     /chore <adw-id> <chore-description>
     # or
     /feature <adw-id> <feature-description>
     ```
   - Review the generated plan
   - Execute `/implement <plan-file>` to implement the fix

9. **Validate the Fix**
   - Run relevant tests based on affected components:
     - Backend API tests: `cd backend && npm run test:api:<module>`
     - Model tests: `cd backend && npm run test:models`
     - E2E tests: `cd frontend && npx playwright test <spec-file>`
   - Use `/search_logs` again to verify logs show expected behavior
   - Confirm the issue no longer reproduces
   - If tests fail, use `/resolve_failed_test` for each failure

## Codebase Structure

### Backend

- `backend/src/index.ts` - API server entry point
- `backend/src/worker.ts` - Background worker process
- `backend/src/routes/` - API endpoint handlers
- `backend/src/services/` - Business logic services
- `backend/src/services/ai/` - AI service domain modules
- `backend/src/services/queue/` - BullMQ queue and worker configuration
- `backend/src/models/` - Sequelize database models
- `backend/src/middleware/` - Express middleware
- `backend/logs/` - Centralized JSON log files

### Frontend

- `frontend/App.tsx` - Application entry point
- `frontend/routes/` - Page components
- `frontend/components/` - UI components
- `frontend/api/` - API client modules
- `frontend/hooks/` - React Query hooks
- `frontend/types/` - TypeScript type definitions

### AI Services Architecture

- `backend/src/services/ai/core/BaseAIService.ts` - Base AI service class
- `backend/src/services/ai/providers/` - AI provider implementations
- `backend/src/services/ai/<domain>/` - Domain-specific AI services (garden, care, pest, plant, weather, layout)

### Queue System

- `backend/src/services/queue/queues/` - Queue definitions
- `backend/src/services/queue/workers/` - Worker job processors
- `backend/src/services/queue/connection.ts` - Redis connection singleton

### Database

- `backend/src/migrations/` - Database migration files
- `backend/src/models/index.ts` - Model registry

### Documentation

- `app_docs/` - Feature specifications and architecture guides
- `specs/` - Active implementation plans
- `.claude/commands/conditional_docs.md` - Documentation reference guide

## Report

Provide a structured troubleshooting report with the following sections:

### Issue Summary

- Brief description of the problem
- Affected components/features
- User impact

### Investigation Findings

- Key evidence from logs (include correlation IDs if available)
- Relevant code locations
- Recent changes that may have contributed

### Root Cause

- Clear explanation of what's causing the issue
- Why it's happening

### Solution Applied (or Recommended)

- Specific changes made to fix the issue
- OR if not fixed: recommended next steps

### Validation Results

- Tests run and their results
- Confirmation that issue is resolved
- OR if not resolved: what still needs investigation

### Preventive Measures

- How to prevent this issue in the future
- Any monitoring or alerts to add
