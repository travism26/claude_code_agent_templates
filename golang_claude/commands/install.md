# Install & Prime

Set up the Go project for development.

## Read

.env.sample (never read .env)
README.md
DESIGN.md

## Read and Execute

.claude/commands/prime.md

## Run

- Think through each of these steps to make sure you don't miss anything.
- Remove the existing git remote: `git remote remove origin` (if needed)
- Initialize a new git repository: `git init` (if needed)
- Download Go dependencies: `go mod download`
- Verify the build: `go build ./...`
- Run tests to verify setup: `go test ./...`

## Report

- Output the work you've just done in a concise bullet point list.
- Instruct the user to fill out the root level ./.env based on .env.sample if it exists.
- Mention: 'To setup your AFK Agent, be sure to update the remote repo url and push to a new repo so you have access to git issues and git prs:
  ```
  git remote add origin <your-new-repo-url>
  git push -u origin main
  ```'
- Mention the CLI command to run the tool (e.g., `go run cmd/app/main.go --help`)
- List any external dependencies that should be installed for full functionality (check README.md)
