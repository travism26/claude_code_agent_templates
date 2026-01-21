# Application Validation Test Suite with Intelligent Selection

Execute comprehensive validation tests for both frontend and backend components with intelligent test selection based on changed files. Returns results in a standardized JSON format for automated processing.

## Purpose

Proactively identify and fix issues in the application before they impact users or developers. By running this comprehensive test suite, you can:

- Detect syntax errors, type mismatches, and import failures
- Identify broken tests or security vulnerabilities
- Verify build processes and dependencies
- Ensure the application is in a healthy state
- **NEW**: Run only tests affected by changed files (module-based selection)

## Variables

TEST_COMMAND_TIMEOUT: 5 minutes
BACKEND_PORT: 3000
FRONTEND_PORT: 3001
RUN_ALL_TESTS: false (set to true to bypass intelligent selection, can be overridden by $ARGUMENTS --run-all-tests flag)
DIFF_BASE: HEAD (can be overridden by $ARGUMENTS --diff-base flag)

## Instructions

IMPORTANT: This test suite includes backend API tests and frontend E2E tests, both of which REQUIRE the backend server to be running on port ${BACKEND_PORT}.

### Intelligent Test Selection

Before running tests, determine which tests are affected by recent changes:

1. Parse command-line arguments from $ARGUMENTS:
   - If `--run-all-tests` is present, set RUN_ALL_TESTS to true
   - If `--diff-base <ref>` is present, set DIFF_BASE to the specified reference
2. Run the test selector: `python3 adws/adw_modules/test_selector.py ${DIFF_BASE} ${RUN_ALL_TESTS ? '--run-all-tests' : ''}`
3. The test selector will output:
   - Selection strategy (full_suite, module_based, or no_changes)
   - Reason for selection
   - List of backend test commands to run
   - List of frontend E2E test files to run
4. Parse the output to determine which tests to execute
5. If selection strategy is "no_changes", skip all tests and return empty JSON array
6. If selection strategy is "full_suite", run all tests as listed in "Test Execution Sequence" below
7. If selection strategy is "module_based", run ONLY the selected tests

**IMPORTANT**: The test selector analyzes git changes and maps them to affected modules. It automatically runs the full suite when core files (config, middleware, auth, etc.) are changed. Use `--run-all-tests` to force running everything.

### Backend Dependency Check

Before running tests, verify the backend is running:

1. Check if backend is running: `lsof -ti:${BACKEND_PORT}`
2. If not running, start backend in background: `cd backend && npm run dev > /tmp/backend.log 2>&1 &`
3. Wait for backend to be ready (5 seconds): `sleep 5`
4. Verify backend responds: `curl -s http://localhost:${BACKEND_PORT}/api/health || echo "Backend not ready"`
5. Ensure database migrations are current: `cd backend && npm run migrate:dev`

### Test Execution Guidelines

- Execute each test in the sequence provided below
- Capture the result (passed/failed) and any error messages
- IMPORTANT: Return ONLY the JSON array with test results
  - IMPORTANT: Do not include any additional text, explanations, or markdown formatting
  - We'll immediately run JSON.parse() on the output, so make sure it's valid JSON
- If a test passes, omit the error field
- If a test fails, include the error message in the error field
- Execute all tests even if some fail
- Error Handling:
  - If a command returns non-zero exit code, mark as failed and immediately stop processing tests
  - Capture stderr output for error field
  - Timeout commands after `TEST_COMMAND_TIMEOUT`
  - IMPORTANT: If a test fails, stop processing tests and return the results thus far
- Some tests may have dependencies (e.g., server must be stopped for port availability)
- Test execution order is important - dependencies should be validated first
- All file paths are relative to the project root
- Always run `pwd` and `cd` before each test to ensure you're operating in the correct directory for the given test

## Test Execution Sequence

**Note on Intelligent Selection**: When using intelligent test selection (module-based strategy), only the tests listed by the test selector will be executed. The following list represents the FULL test suite that runs when:
- `--run-all-tests` flag is used
- Core files are changed (triggers full_suite strategy)
- Unknown files are changed (safe fallback to full suite)

**Mapping Test Selector Commands to Tests**:
- `npm test` → Run ALL backend tests (1-5)
- `npm run test:models` → Run test #3 (Backend Model Tests) - if available
- `npm run test:routes` → Run test #4 (Backend API/Routes Tests) - if available
- `npm run test:services` → Run service-specific tests - if available
- `e2e/` → Run ALL E2E tests
- `e2e/specific.spec.ts` → Run specific E2E test file

### Backend Tests

IMPORTANT: Backend tests 3 and 4 require the backend server to be running. Ensure backend is started before executing these tests.

1. **Backend TypeScript Type Check**

   - Preparation Command: None
   - Command: `cd backend && npx tsc --noEmit`
   - test_name: "backend_typescript_check"
   - test_purpose: "Validates TypeScript type correctness in backend code without generating output files, catching type errors, missing imports, and incorrect function signatures"

2. **Backend Code Quality Check**

   - Preparation Command: None
   - Command: `cd backend && npm run lint`
   - test_name: "backend_linting"
   - test_purpose: "Validates Node.js/Express backend code quality using ESLint, identifies unused imports, style violations, and potential bugs"

3. **Backend Model/Database Tests**

   - Preparation Command: Ensure backend is running on port ${BACKEND_PORT}
   - Command: `cd backend && npm run test:models` (or `npm test` if no separate model tests)
   - test_name: "backend_model_tests"
   - test_purpose: "Validates database models, schema, data validation with SQLite (requires backend running)"

4. **Backend API/Route Tests**

   - Preparation Command: Ensure backend is running on port ${BACKEND_PORT}
   - Command: `cd backend && npm run test:routes` (or `npm test` if no separate route tests)
   - test_name: "backend_api_tests"
   - test_purpose: "Validates Express API endpoints, request/response handling, and business logic (requires backend running)"

5. **Backend Build**
   - Preparation Command: None
   - Command: `cd backend && npm run build`
   - test_name: "backend_build"
   - test_purpose: "Validates the backend build process using esbuild, ensuring all TypeScript compiles correctly and dependencies are bundled"

### Frontend Tests

6. **Frontend TypeScript Type Check**

   - Preparation Command: None
   - Command: `cd frontend && npx tsc --noEmit`
   - test_name: "frontend_typescript_check"
   - test_purpose: "Validates TypeScript type correctness in React/Next.js frontend without generating output files, catching type errors, missing imports, and incorrect function signatures"

7. **Frontend Code Quality Check**

   - Preparation Command: None
   - Command: `cd frontend && npm run lint`
   - test_name: "frontend_linting"
   - test_purpose: "Validates React/Next.js frontend code quality using ESLint, identifies unused imports, style violations, React best practices, and potential bugs"

8. **Frontend Build**

   - Preparation Command: None
   - Command: `cd frontend && npm run build`
   - test_name: "frontend_build"
   - test_purpose: "Validates the complete Next.js frontend build process including bundling, asset optimization, and production compilation"

## Report

- IMPORTANT: Return results exclusively as a JSON array based on the `Output Structure` section below.
- Sort the JSON array with failed tests (passed: false) at the top
- Include all tests in the output, both passed and failed
- The execution_command field should contain the exact command that can be run to reproduce the test
- This allows subsequent agents to quickly identify and resolve errors

### Output Structure

```json
[
  {
    "test_name": "string",
    "passed": boolean,
    "execution_command": "string",
    "test_purpose": "string",
    "error": "optional string"
  },
  ...
]
```

### Example Output

```json
[
  {
    "test_name": "frontend_build",
    "passed": false,
    "execution_command": "cd frontend && npm run build",
    "test_purpose": "Validates the complete Next.js frontend build process including bundling, asset optimization, and production compilation",
    "error": "TS2345: Argument of type 'string' is not assignable to parameter of type 'number'"
  },
  {
    "test_name": "backend_api_tests",
    "passed": true,
    "execution_command": "cd backend && npm run test:api",
    "test_purpose": "Validates Express API endpoints, authentication, request/response handling, and business logic"
  }
]
```
