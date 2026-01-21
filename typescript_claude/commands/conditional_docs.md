# Conditional Documentation Guide

This prompt helps you determine what documentation you should read based on the specific changes you need to make in the codebase. Review the conditions below and read the relevant documentation before proceeding with your task.

## Instructions

- Review the task you've been asked to perform
- Check each documentation path in the Conditional Documentation section
- For each path, evaluate if any of the listed conditions apply to your task
  - IMPORTANT: Only read the documentation if any one of the conditions match your task
- IMPORTANT: You don't want to excessively read documentation. Only read the documentation if it's relevant to your task.

## Conditional Documentation

- README.md

  - Conditions:
    - When first understanding the project structure
    - When you want to learn the commands to build or run the application
    - When understanding the overall architecture

- DESIGN.md

  - Conditions:
    - When understanding the overall application architecture
    - When adding new API endpoints or routes
    - When implementing new features that span frontend and backend
    - When working with database schema changes
    - IMPORTANT: Required reading before implementing any major feature

- .adw/README.md

  - Conditions:
    - When you're operating in the `.adw/` directory
    - When working with AI Developer Workflows

- .claude/commands/classify_adw.md

  - Conditions:
    - When adding or removing new `.adw/adw_*.py` files

## TypeScript Project Structure

The project follows a full-stack TypeScript architecture:

```
project/
├── backend/                  # Express.js + TypeScript backend
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic layer
│   │   ├── models/           # Database models
│   │   ├── middleware/       # Express middleware
│   │   ├── utils/            # Utility functions
│   │   └── index.ts          # Entry point
│   ├── migrations/           # Database migrations
│   ├── tests/                # Backend tests
│   └── package.json
├── frontend/                 # Next.js + React frontend
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   ├── components/       # React components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── lib/              # Utility libraries
│   │   ├── hooks/            # Custom React hooks
│   │   └── types/            # TypeScript type definitions
│   ├── public/               # Static assets
│   └── package.json
├── specs/                    # Feature specifications and plans
├── app_docs/                 # Feature documentation
├── .claude/commands/         # Claude command templates
└── README.md
```

## Development Patterns

When working on this TypeScript project:

- **Adding API endpoints**: Create routes in `backend/src/routes/`, services in `backend/src/services/`
- **Adding React components**: Follow patterns in `frontend/src/components/`
- **Database changes**: Add migrations in `backend/migrations/`, update models in `backend/src/models/`
- **Adding pages**: Use Next.js app router in `frontend/src/app/`
- **Shared types**: Define in `frontend/src/types/` or create shared type definitions
- **UI components**: Use shadcn/ui components from `frontend/src/components/ui/`

## Adding Feature Documentation

When you implement a significant feature, document it in `app_docs/` and add an entry to this file:

```markdown
- app_docs/feature-{adw_id}-{name}.md

  - Conditions:
    - When working with {feature description}
    - When troubleshooting {related issues}
    - When extending {related functionality}
```

This helps future development by providing context-specific documentation that can be loaded conditionally based on the task at hand.
