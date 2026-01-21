# Chore Planning

Create a plan to complete the chore using the specified markdown `Plan Format`. Research the codebase and create a thorough plan.

## Variables

adw_id: $1
prompt: $2

## Instructions

- IMPORTANT: You're writing a plan to resolve a chore based on the `Chore` that will add value to the application.
- IMPORTANT: The `Chore` describes the chore that will be resolved but remember we're not resolving the chore, we're creating the plan that will be used to resolve the chore based on the `Plan Format` below.
- If the adw_id or prompt is not provided, stop and ask the user to provide them.
- Create a plan to complete the chore described in the `prompt`
- You're writing a plan to resolve a chore, it should be simple but we need to be thorough and precise so we don't miss anything or waste time with any second round of changes.
- Create the plan in the `specs/` directory with filename: `chore-{adw_id}-{descriptive-name}.md`
  - Replace `{descriptive-name}` with a short, descriptive name based on the chore (e.g., "update-readme", "add-logging", "refactor-agent")
- Research the codebase starting with `README.md`
- Replace every <placeholder> in the `Plan Format` with the requested value

## Codebase Structure

- `README.md` - Project overview and instructions (start here)
- `backend/` - Backend application code (Node.js + Express + TypeScript + SQLite)
- `frontend/` - Frontend application code (Next.js + React + shadcn/ui)
- `.claude/commands/` - Claude command templates
- `specs/` - Specification and plan documents

- Read `.claude/commands/conditional_docs.md` to check if your task requires additional documentation
- If your task matches any of the conditions listed, include those documentation files in the `Plan Format: Relevant Files` section of your plan

Ignore all other files in the codebase.

## Plan Format

```md
# Chore: <chore name>

## Metadata

adw_id: `{adw_id}`
prompt: `{prompt}`

## Chore Description

<describe the chore in detail based on the prompt>

## Relevant Files

Use these files to complete the chore:

<list files relevant to the chore with bullet points explaining why. Include new files to be created under an h3 'New Files' section if needed>

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers with bullet points. Start with foundational changes then move to specific changes. Last step should validate the work>

### 1. <First Task Name>

- <specific action>
- <specific action>

### 2. <Second Task Name>

- <specific action>
- <specific action>

## Validation Commands

Execute these commands to validate the chore is complete:

<list specific commands to validate the work. Be precise about what to run>
- Example: `cd backend && npm test` - Run backend tests to validate changes
- Example: `cd frontend && npx tsc --noEmit` - Run TypeScript check to validate changes
- Example: `cd frontend && npm run build` - Validate frontend build succeeds

## Notes

<optional additional context or considerations>
```

## Chore

Use the chore description from the `prompt` variable.

## Report

Return ONLY the relative path to the plan file created (e.g., `specs/chore-9dfe4a36-description.md`).

IMPORTANT: Do NOT include any summary, explanation, or additional text. Return only the file path.
