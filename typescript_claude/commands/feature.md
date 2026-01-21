# Feature Planning

Create a plan to implement the feature using the specified markdown `Plan Format`. Research the codebase and create a thorough plan.

## Variables

adw_id: $1
prompt: $2

## Instructions

- If the adw_id or prompt is not provided, stop and ask the user to provide them.
- Create a plan to implement the feature described in the `prompt`
- The plan should be comprehensive, well-designed, and follow existing patterns
- Create the plan in the `specs/` directory with filename: `feature-{adw_id}-{descriptive-name}.md`
  - Replace `{descriptive-name}` with a short, descriptive name based on the feature (e.g., "add-agent-logging", "implement-retry-logic", "create-workflow-api")
- Research the codebase starting with `README.md`
- Replace every <placeholder> in the `Plan Format` with the requested value
- Use your reasoning model: THINK HARD about the feature requirements, design, and implementation approach
- Follow existing patterns and conventions in the codebase
- Design for extensibility and maintainability
- If your task requires updating the frontend ensure you are adding `data-testid` attributes to relevant elements for easier selection in tests.

## Relevant Files

- `README.md` - Project overview and instructions (start here)
- `backend/` - Backend application code (Node.js + Express + TypeScript + SQLite)
- `frontend/` - Frontend application code (Next.js + React + shadcn/ui)
- `.claude/commands/` - Claude command templates
- `specs/` - Specification and plan documents

**Documentation to Check**:

- Read `.claude/commands/conditional_docs.md` to check if your task requires additional documentation
- If your task matches any of the conditions listed, include those documentation files in the `Plan Format: Relevant Files` section of your plan
- When your plan includes creating tests, search for testing documentation files (e.g., `HOW_TO_CREATE_TESTS.md`, `TESTING.md`) in the relevant directories before writing tests

## Plan Format

```md
# Feature: <feature name>

## Metadata

adw_id: `{adw_id}`
prompt: `{prompt}`

## Feature Description

<describe the feature in detail, including its purpose and value to users>

## User Story

As a <type of user>
I want to <action/goal>
So that <benefit/value>

## Problem Statement

<clearly define the specific problem or opportunity this feature addresses>

## Solution Statement

<describe the proposed solution approach and how it solves the problem>

## Relevant Files

Use these files to implement the feature:

<list files relevant to the feature with bullet points explaining why. Include new files to be created under an h3 'New Files' section if needed>

## Implementation Plan

### Phase 1: Foundation

<describe the foundational work needed before implementing the main feature>

### Phase 2: Core Implementation

<describe the main implementation work for the feature>

### Phase 3: Integration

<describe how the feature will integrate with existing functionality>

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers with bullet points. Start with foundational changes then move to specific changes. Include creating tests throughout the implementation process>

### 1. <First Task Name>

- <specific action>
- <specific action>

### 2. <Second Task Name>

- <specific action>
- <specific action>

<continue with additional tasks as needed>

## Testing Strategy

**IMPORTANT**: Before creating tests, check for testing documentation:

- Look for files like `HOW_TO_CREATE_TESTS.md`, `TESTING.md`, or `README.md` in the relevant test directory
- Follow existing patterns and use available test helpers/utilities
- Use centralized configuration (never hardcode URLs, ports, or environment-specific values)

### Unit Tests

<describe unit tests needed for the feature>

### Integration/E2E Tests

<describe integration or E2E tests needed for the feature>

### Edge Cases

<list edge cases that need to be tested>

## Acceptance Criteria

<list specific, measurable criteria that must be met for the feature to be considered complete>

## Validation Commands

Execute these commands to validate the feature is complete:

<list specific commands to validate the work. Be precise about what to run>
- Example: `cd backend && npm test` - Run backend tests to validate the feature
- Example: `cd frontend && npx tsc --noEmit` - Run frontend TypeScript check
- Example: `cd frontend && npm run build` - Validate frontend build succeeds

## Notes

<optional additional context, future considerations, or dependencies. If new libraries are needed, specify using `npm install`>
```

## Feature

Use the feature description from the `prompt` variable.

## Report

Return ONLY the relative path to the plan file created (e.g., `specs/feature-8-9dfe4a36-description.md`).

IMPORTANT: Do NOT include any summary, explanation, or additional text. Return only the file path.
