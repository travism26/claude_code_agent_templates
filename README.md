# Claude Code Agent Templates

A collection of examples demonstrating how to use `@.adw/` (AI Developer Workflows) modules across different programming languages and frameworks.

## Overview

ADW is a framework that orchestrates AI agents through a complete Software Development Lifecycle (SDLC) pipeline:

```
Prompt ──► Plan ──► Build ──► Validate ──► Test ──► Review ──► Document
```

Each phase handles a specific part of the development workflow:

- **Plan** - Researches your codebase and creates detailed implementation specs
- **Build** - Implements features following your existing patterns
- **Validate** - Runs linters, static analysis, and auto-fixes violations
- **Test** - Executes tests and automatically fixes failures
- **Review** - Compares implementation against specs, flags issues
- **Document** - Generates documentation for the implemented feature

## Architecture

ADW uses a three-layer architecture where only the middle layer is language-specific:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Orchestrator (Python)      LANGUAGE-AGNOSTIC     │
│  Chains phases, manages state, handles retries             │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Slash Commands (Markdown)   LANGUAGE-SPECIFIC    │
│  /test, /validate, /review - customize per language        │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Agent Module (Python)      LANGUAGE-AGNOSTIC     │
│  Claude Code execution, retry logic, state management      │
└─────────────────────────────────────────────────────────────┘
```

This means adding support for a new language only requires writing new slash commands.

## Current Examples

- **golang_claude/** - Go language implementation
- **typescript_claude/** - TypeScript implementation

### Full Project Example

- **example_projects/role_matcher_typescript_webapp/** - A complete TypeScript webapp with frontend and backend, fully configured with ADW workflows. Use this as a reference for setting up ADW in a real project.

## Coming Soon

More languages and frameworks will be added in the future, including:

- Java
- Rust
- Python
- And more...
