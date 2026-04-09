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
- **template_claude/** - Language-agnostic template with `{{PLACEHOLDER}}` tokens, paired with an `/install-adw` slash command that auto-detects your project's tooling and populates the commands for you

### Full Project Example

- **example_projects/role_matcher_typescript_webapp/** - A complete TypeScript webapp with frontend and backend, fully configured with ADW workflows. Use this as a reference for setting up ADW in a real project.

## Installing ADW in Your Project

Use the language-agnostic `template_claude/` to bootstrap ADW into any repo, regardless of language. The `/install-adw` slash command will inspect your project, detect its language, package manager, linter, and test framework, and rewrite every placeholder in the templated commands with the right values.

### Step 1: Copy the template files into your repo

From the root of your target project:

```bash
# Copy the language-agnostic slash commands
mkdir -p .claude/commands
cp -R /path/to/claude_code_agent_templates/template_claude/commands/. .claude/commands/

# Copy the ADW orchestrator modules
cp -R /path/to/claude_code_agent_templates/.adw .adw
```

After this you should have:

```
your-project/
├── .adw/                  # ADW Python orchestrator + modules
└── .claude/
    └── commands/          # Slash commands (still contain {{PLACEHOLDER}} tokens)
        ├── install-adw.md
        ├── implement.md
        ├── test.md
        ├── validate.md
        └── ...
```

### Step 2: Run `/install-adw`

Open Claude Code in your project root and run:

```
/install-adw
```

The command will:

1. Detect your project's language by scanning manifest files (`go.mod`, `package.json`, `Cargo.toml`, `pyproject.toml`, `pom.xml`, etc.)
2. Detect the package manager from lockfiles, plus the linter, formatter, type-checker, and test framework from their config files
3. Build a substitution map of every placeholder → concrete value for your project
4. **Show you the detected configuration and ask for confirmation before writing**
5. Replace every `{{KEY}}` in every templated command file with the project-specific value
6. Verify zero leftover placeholders remain and report any that need manual attention

### Step 3: Verify and commit

```bash
# Sanity-check that the commands now match your project
/prime

# Commit the populated workflow
git add .adw .claude
git commit -m "chore: install ADW workflows"
```

You can now use `/feature`, `/bug`, `/chore`, `/implement`, `/test`, `/validate`, `/review`, and `/document` against your project.

> **Tip:** If `/install-adw` guesses something wrong, re-run it with `force_overwrite=true` after editing the placeholders manually, or just edit individual command files in `.claude/commands/` directly.

## Coming Soon

More languages and frameworks will be added in the future, including:

- Java
- Rust
- Python
- And more...
