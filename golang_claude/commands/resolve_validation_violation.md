# Resolve Validation Violation

Fix a specific code validation violation by applying the minimal, targeted changes required to resolve the issue.

## Purpose

Automatically resolve code quality violations detected by the `/validate` command by:

- Analyzing the specific violation (rule, file, location, message)
- Understanding the context and current code structure
- Applying rule-specific fixes that maintain code quality standards
- Verifying the fix resolves the violation

## Arguments

This command expects a JSON violation object as an argument with the following structure:

```json
{
  "rule": "string",
  "file": "string",
  "line": number | null,
  "column": number | null,
  "severity": "error" | "warning",
  "message": "string",
  "fix_suggestion": "string" | null
}
```

## Instructions

### 1. Analyze the Violation

Parse the provided violation JSON to understand:
- **Rule**: Which code quality rule was violated
- **File**: The file containing the violation
- **Line/Column**: Exact location of the violation
- **Message**: Specific violation details
- **Fix Suggestion**: Guidance on how to fix (if available)

### 2. Context Discovery

Read the affected file to understand:
- Current code structure around the violation
- What packages/imports are being used incorrectly
- What the code is trying to accomplish

### 3. Determine Fix Strategy

Based on the rule violated, apply the appropriate fix:

#### For `go-vet` violations

Common go vet issues:
- Printf format mismatches
- Unreachable code
- Shadowed variables
- Composite literal issues

Fix by addressing the specific issue reported.

#### For `gofmt` violations

Files not properly formatted:
1. Run `gofmt -w <file>` to auto-format
2. Verify formatting matches Go standards

#### For `gofumpt` violations (golangci-lint/gofumpt)

**IMPORTANT**: `gofumpt` is a stricter formatter than `gofmt`. The standalone `gofumpt` tool may have different rules than what `golangci-lint` uses internally. Always verify fixes using `golangci-lint run`, NOT `gofumpt -l`.

**DO NOT just run `gofumpt -w <file>`** - this may not fix the actual violation. Instead, read the specific line mentioned in the violation and apply the fix manually.

Common gofumpt rules and fixes:

**Parameter grouping**: Consecutive parameters of the same type must be combined
```go
// Before (violation)
func(chunk int, total int)
OnComplete func(current int, max int)

// After (fixed)
func(chunk, total int)
OnComplete func(current, max int)
```

**Return parameter grouping**: Same rule applies to return values
```go
// Before (violation)
func foo() (string, error, error)  // Cannot group different types - this is fine
func bar() (a int, b int) { }

// After (fixed)
func bar() (a, b int) { }
```

**Composite literal formatting**: Proper formatting for struct/slice literals
```go
// Before (violation)
x := []int{1,2,3}

// After (fixed)
x := []int{1, 2, 3}
```

**Import grouping**: Imports must be properly grouped (stdlib, external, internal)
```go
// Before (violation)
import (
    "fmt"
    "github.com/external/pkg"
    "strings"
)

// After (fixed)
import (
    "fmt"
    "strings"

    "github.com/external/pkg"
)
```

**Fix Steps for gofumpt**:
1. Read the specific line mentioned in the violation
2. Identify which gofumpt rule is being violated (parameter grouping, imports, etc.)
3. Manually edit the code to fix the specific issue
4. Verify with `golangci-lint run <file>` (NOT `gofumpt -l`)

#### For `golangci-lint` violations

Common linter issues and fixes:

**errcheck**: Unchecked errors
```go
// Before
file.Close()

// After
if err := file.Close(); err != nil {
    return fmt.Errorf("failed to close file: %w", err)
}
```

**ineffassign**: Ineffectual assignment
```go
// Before
result := doSomething()
result = doSomethingElse()  // First assignment unused

// After
_ = doSomething()  // Or remove if not needed
result := doSomethingElse()
```

**unused**: Unused variables/functions
```go
// Before
func unusedFunction() {}
var unusedVar = 123

// After
// Remove them or prefix with underscore if required by interface
```

**gosimple**: Code can be simplified
```go
// Before
if x == true {

// After
if x {
```

### 4. Apply the Fix

Make the minimal necessary changes:
- Edit only the affected file(s)
- Keep changes focused on resolving the specific violation
- Don't refactor unrelated code
- Maintain Go idioms and patterns

### 5. Validate the Fix

After applying changes:
1. **CRITICAL**: Always verify using `golangci-lint run <file>` to confirm the specific violation is resolved
2. Do NOT rely on standalone tools like `gofumpt -l` or `gofmt -l` - they may have different rules than golangci-lint
3. Verify the specific violation no longer appears in the output
4. Check that no new violations were introduced
5. Run tests: `go test ./...`

**Verification command**:
```bash
golangci-lint run <file> 2>&1 | grep -i "<rule-name>"
# If no output, the violation is fixed
```

## Report Format

After fixing the violation, provide a concise report:

```markdown
### Violation Resolved

**Rule**: <rule-name>
**File**: <file-path>:<line>

**Changes Made**:
- <Brief description of what was changed>
- <Brief description of what was changed>

**Verification**:
- Re-ran validation: [PASS/FAIL]
- Violation resolved: [YES/NO]
- Tests passing: [YES/NO]
```

## Examples

### Example 1: Fixing errcheck

**Violation**:
```json
{
  "rule": "golangci-lint/errcheck",
  "file": "pkg/service/handler.go",
  "line": 78,
  "column": 9,
  "severity": "error",
  "message": "Error return value of 'cmd.Run' is not checked",
  "fix_suggestion": "Check and handle the error: if err := cmd.Run(); err != nil { ... }"
}
```

**Fix Steps**:
1. Read `pkg/service/handler.go` line 78
2. Add proper error handling for cmd.Run()
3. Return or handle the error appropriately
4. Re-run `golangci-lint run`

### Example 2: Fixing gofmt

**Violation**:
```json
{
  "rule": "gofmt",
  "file": "internal/cli/root.go",
  "line": null,
  "column": null,
  "severity": "warning",
  "message": "File is not properly formatted",
  "fix_suggestion": "Run 'gofmt -w internal/cli/root.go' to fix formatting"
}
```

**Fix Steps**:
1. Run `gofmt -w internal/cli/root.go`
2. Verify with `golangci-lint run internal/cli/root.go` (confirm no gofmt errors)

### Example 3: Fixing go vet printf format

**Violation**:
```json
{
  "rule": "go-vet/printf",
  "file": "pkg/utils/format.go",
  "line": 45,
  "column": 12,
  "severity": "error",
  "message": "Printf format %d has arg of wrong type string",
  "fix_suggestion": "Change format specifier to %s or convert argument to int"
}
```

**Fix Steps**:
1. Read line 45 of format.go
2. Identify the Printf call
3. Match format specifier to argument type
4. Update format string or convert argument

### Example 4: Fixing gofumpt parameter grouping

**Violation**:
```json
{
  "rule": "golangci-lint/gofumpt",
  "file": "pkg/processor/chunked.go",
  "line": 28,
  "column": 1,
  "severity": "error",
  "message": "File is not properly formatted",
  "fix_suggestion": "Run 'gofumpt -w pkg/processor/chunked.go' to fix formatting"
}
```

**Fix Steps** (DO NOT just run gofumpt -w):
1. Read line 28 of chunked.go to see the actual code:
   ```go
   OnChunkComplete func(chunk int, total int)
   ```
2. Identify the gofumpt rule violation: consecutive parameters of same type not grouped
3. Manually edit to combine parameters:
   ```go
   OnChunkComplete func(chunk, total int)
   ```
4. Verify with `golangci-lint run pkg/processor/chunked.go`
5. Confirm no gofumpt errors in output

**Why not just run `gofumpt -w`?**
The standalone `gofumpt` tool may use different rules or versions than `golangci-lint`'s internal gofumpt linter. Running `gofumpt -w` might fix unrelated issues (like spelling) but miss the actual violation. Always read the specific line and fix manually.

## Notes

- Focus on fixing ONE violation at a time
- Don't make changes beyond what's needed to fix the violation
- Follow Go best practices and idioms
- **ALWAYS verify using `golangci-lint run <file>`** - never rely on standalone tools (gofumpt, gofmt) for verification as they may have different rules
- For gofumpt violations, read the specific line and fix manually - don't just run `gofumpt -w`
- If the fix introduces new violations, adjust the approach
- Run `go test ./...` to ensure no regressions
