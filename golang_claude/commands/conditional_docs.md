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
    - When you want to learn the commands to build or run the CLI tool
    - When understanding the overall architecture

- DESIGN.md

  - Conditions:
    - When understanding the overall tool architecture
    - When adding new modules or packages
    - When implementing new features
    - When working with external integrations
    - When adding new CLI commands
    - IMPORTANT: Required reading before implementing any major feature

- .adw/README.md

  - Conditions:
    - When you're operating in the `.adw/` directory
    - When working with AI Developer Workflows

- .claude/commands/classify_adw.md

  - Conditions:
    - When adding or removing new `.adw/adw_*.py` files

## Go Project Structure

The project follows standard Go project layout:

```
project/
├── cmd/app/              # Main application entry point
├── internal/             # Private application code
│   ├── cli/              # CLI commands (cobra)
│   ├── config/           # Configuration management
│   └── ...               # Other internal packages
├── pkg/                  # Public library code
│   ├── models/           # Data models
│   └── ...               # Other public packages
├── configs/              # Configuration files
├── templates/            # Templates (if applicable)
└── go.mod                # Go module file
```

## Development Patterns

When working on this Go project:

- **Adding CLI commands**: Look at `internal/cli/` for existing patterns
- **Adding new modules**: Follow patterns in `pkg/` - implement relevant interfaces
- **Configuration**: Use `internal/config/` for app configuration
- **Data models**: Define in `pkg/models/`
