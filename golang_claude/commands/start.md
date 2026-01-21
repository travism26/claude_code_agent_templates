# Start Go CLI Application

## Instructions

This command starts the Go CLI tool in development or production mode.

### Prerequisites

Before running these commands, ensure:

1. Go dependencies are installed: `go mod download`
2. Environment variables are configured in `.env` if needed
3. Configuration file exists (check README.md for location)

### Running the Tool

The CLI tool can be run in several ways:

## Run

# Build and run the tool
go run cmd/app/main.go --help

# Or build first, then run
go build -o app cmd/app/main.go
./app --help

# Run a specific command
./app <command> [options]

# Initialize a new project (if applicable)
./app init myproject
