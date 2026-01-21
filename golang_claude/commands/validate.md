# Go Code Validation

Run comprehensive Go code validation including compilation, linting, static analysis, and formatting checks. Returns violations in a standardized JSON format.

## Purpose

Enforce code quality, security, and Go best practices by:

- Verifying Go code compiles successfully (`go build`)
- Running `go vet` for static analysis
- Checking code formatting with `gofmt`
- Running `golangci-lint` for comprehensive linting (if available)
- Identifying potential bugs, security issues, and code quality problems
- Returning actionable violation reports with file:line references

**Note:** This command runs all static analysis and linting checks. For running unit tests, use the `/test` command instead.

## Variables

VALIDATION_TIMEOUT: 5 minutes

## Code Quality & Linting Standards

The project enforces comprehensive code quality standards using golangci-lint with multiple linters.

### Enabled Linters

#### Security Linters (Critical)
- **gosec**: OWASP security vulnerability detection
- **bodyclose**: Ensures HTTP response bodies are closed
- **noctx**: Requires context.Context in HTTP requests
- **sqlclosecheck**: Ensures database resources are properly closed

#### Error Handling Linters
- **errcheck**: Detects unchecked errors
- **errorlint**: Enforces proper Go 1.13+ error wrapping
- **nilerr**: Catches returning nil when error is not nil

#### Code Quality & Complexity
- **cyclop**: Cyclomatic complexity limits (max: 30)
- **gocognit**: Cognitive complexity limits (max: 25)
- **funlen**: Function length limits (100 lines, 60 statements)
- **nestif**: Deeply nested if statement detection
- **gocyclo**: Alternative cyclomatic complexity checker

#### Bug Detection & Static Analysis
- **staticcheck**: Comprehensive static analysis
- **govet**: Go standard checks
- **ineffassign**: Ineffective assignments
- **unparam**: Unused function parameters
- **gosimple**: Code simplification suggestions
- **unused**: Unused code detection

#### Style & Formatting
- **goimports**: Import organization and formatting
- **gofumpt**: Stricter gofmt variant
- **misspell**: Spelling checker for comments/strings
- **whitespace**: Unnecessary blank lines
- **godot**: Comment punctuation consistency

#### Best Practices
- **gocritic**: Opinionated Go checker
- **goconst**: Repeated string detection (suggest constants)
- **revive**: Fast, flexible linter
- **nakedret**: Naked return detection

## Instructions

Execute Go validation and return results as a JSON array of violations.

### Execution Steps

1. **Verify compilation**
   ```bash
   go build ./... 2>&1
   ```
   This ensures all Go code compiles successfully before running further checks.

2. **Run go vet (static analysis)**
   ```bash
   go vet ./... 2>&1
   ```

3. **Check formatting**
   ```bash
   gofmt -l .
   ```
   (Any files listed are not properly formatted)

4. **Run golangci-lint (if available)**
   ```bash
   which golangci-lint && golangci-lint run --out-format json
   ```
   Skip if golangci-lint is not installed.

5. **Parse the output**
   - Parse each tool's output
   - Categorize by severity (error vs warning)
   - Compilation failures are always errors
   - go vet issues are typically errors (potential bugs)
   - gofmt issues are typically warnings (style)
   - golangci-lint categorizes based on the specific linter
   - Exit code 0 = no critical violations

6. **Return results**
   - IMPORTANT: Return ONLY the JSON array with violations
   - Do not include any additional text, explanations, or markdown formatting
   - We'll immediately run JSON.parse() on the output
   - If validation fails to run, return error as JSON

## Common Validation Issues & Fixes

### Compilation Errors (go build)
```go
// Bad - Undefined function
result := UndefinedFunc()

// Good - Use defined functions
result := DefinedFunc()
```

### Unchecked Errors (errcheck)
```go
// Bad
resp, _ := http.Get(url)

// Good
resp, err := http.Get(url)
if err != nil {
    return fmt.Errorf("fetching url: %w", err)
}
defer resp.Body.Close()
```

### Error Wrapping (errorlint)
```go
// Bad
if err != nil {
    return errors.New("failed to process")
}

// Good
if err != nil {
    return fmt.Errorf("failed to process: %w", err)
}
```

### HTTP Request Context (noctx)
```go
// Bad
req, err := http.NewRequest("GET", url, nil)

// Good
req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
```

### Security Issues (gosec)
```go
// Bad - Command injection risk (G204)
cmd := exec.Command("sh", "-c", userInput)

// Good - Use argument array
cmd := exec.Command("tool", "--flag", userInput)

// Bad - Weak crypto (G401)
h := md5.New()

// Good - Strong crypto
h := sha256.New()
```

### Complexity Issues
Break down complex functions into smaller, more testable units:
- Keep functions under 100 lines
- Keep cyclomatic complexity under 30
- Keep cognitive complexity under 25

## Error Handling

If the validation fails to execute:
- Capture the error message
- Return as a single-item JSON array with a validation-error violation
- Example:
  ```json
  [
    {
      "rule": "validation-error",
      "file": "unknown",
      "line": null,
      "column": null,
      "severity": "error",
      "message": "Failed to run validation: <error message>",
      "fix_suggestion": null
    }
  ]
  ```

## Report

Return results exclusively as a JSON array matching the ValidationViolation schema:

### Output Structure

```json
[
  {
    "rule": "string",
    "file": "string",
    "line": number | null,
    "column": number | null,
    "severity": "error" | "warning",
    "message": "string",
    "fix_suggestion": "string" | null
  },
  ...
]
```

### Example Output - No Violations

```json
[]
```

### Example Output - With Violations

```json
[
  {
    "rule": "go-build/compile",
    "file": "pkg/service/handler.go",
    "line": 45,
    "column": 12,
    "severity": "error",
    "message": "undefined: SomeFunction",
    "fix_suggestion": "Define SomeFunction or import the correct package"
  },
  {
    "rule": "go-vet/printf",
    "file": "pkg/utils/format.go",
    "line": 123,
    "column": 12,
    "severity": "error",
    "message": "Printf format %d has arg of wrong type string",
    "fix_suggestion": "Change format specifier to %s or convert argument to int"
  },
  {
    "rule": "gofmt",
    "file": "internal/cli/root.go",
    "line": null,
    "column": null,
    "severity": "warning",
    "message": "File is not properly formatted",
    "fix_suggestion": "Run 'gofmt -w internal/cli/root.go' to fix formatting"
  },
  {
    "rule": "golangci-lint/errcheck",
    "file": "pkg/config/loader.go",
    "line": 78,
    "column": 9,
    "severity": "warning",
    "message": "Error return value of 'file.Close' is not checked",
    "fix_suggestion": "Check and handle the error: if err := file.Close(); err != nil { ... }"
  }
]
```

## Notes

- Only critical violations (severity: "error") should fail the validation phase
- Warnings (severity: "warning") are informational and don't fail validation
- go vet issues are typically errors (potential bugs)
- gofmt issues are typically warnings (style)
- golangci-lint categorizes based on the specific linter
