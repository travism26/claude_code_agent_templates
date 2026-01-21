# E2E Test Runner with Intelligent Selection

Execute end-to-end (E2E) tests using Playwright browser automation (MCP Server) with intelligent test selection based on changed files. If any errors occur and assertions fail mark the test as failed and explain exactly what went wrong.

## Variables

adw_id: $ARGUMENT if provided, otherwise generate a random 8 character hex string
agent_name: $ARGUMENT if provided, otherwise use 'test_e2e'
e2e_test_file: $ARGUMENT (can be specific file or empty for intelligent selection)
BACKEND_PORT: 3000
FRONTEND_PORT: 3001
application_url: http://localhost:${FRONTEND_PORT} (Next.js frontend, runs on 3001 when backend is on 3000)
backend_api_url: http://localhost:${BACKEND_PORT}/api (Express backend API)
RUN_ALL_E2E: false (set to true via $ARGUMENTS --run-all-e2e to run all E2E tests)
DIFF_BASE: HEAD (can be overridden by $ARGUMENTS --diff-base flag)

## Prerequisites

IMPORTANT: E2E tests require the backend API server to be running. The tests make actual HTTP requests to `http://localhost:${BACKEND_PORT}/api` for authentication, data operations, and API validation.

Before running E2E tests:

1. **Verify Backend is Running**: Check if backend is running on port:${BACKEND_PORT}

   ```bash
   lsof -ti:${BACKEND_PORT}
   ```

2. **Start Backend if Needed**: If backend is not running, start it in the background:

   ```bash
   cd backend && npm run dev > /tmp/backend.log 2>&1 &
   ```

3. **Wait for Backend**: Allow backend to fully start (5 seconds):

   ```bash
   sleep 5
   ```

4. **Verify Backend Health**: Confirm backend is responding:

   ```bash
   curl -s http://localhost:${BACKEND_PORT}/api/health || echo "Backend not ready - E2E tests will fail"
   ```

5. **Run Database Migrations**: Ensure database schema is current:
   ```bash
   cd backend && npm run migrate:dev
   ```

If the backend is not running, E2E tests WILL FAIL with authentication errors, network timeouts, or API connection failures.

## Instructions

### Intelligent E2E Test Selection

If `e2e_test_file` is NOT provided, use intelligent selection:

1. Parse command-line arguments from $ARGUMENTS:
   - If `--run-all-e2e` is present, set RUN_ALL_E2E to true
   - If `--diff-base <ref>` is present, set DIFF_BASE to the specified reference
2. Run the test selector: `python3 adws/adw_modules/test_selector.py ${DIFF_BASE} ${RUN_ALL_E2E ? '--run-all-tests' : ''}`
3. Extract the `frontend_e2e_files` list from the test selector output
4. If the list contains `e2e/`, run ALL E2E tests
5. If the list contains specific files (e.g., `e2e/auth.spec.ts`), run only those tests
6. If the list is empty, skip E2E tests (no frontend changes detected)

If `e2e_test_file` IS provided, run that specific test (legacy behavior for manual test execution).

**IMPORTANT**: The test selector maps frontend component and route changes to their corresponding E2E tests. For example:
- Changes to task-related components → `e2e/tasks.spec.ts`
- Changes to auth components → `e2e/auth.spec.ts`
- Changes to core files (Layout.tsx, _app.tsx, page.tsx) → ALL E2E tests

### Test Execution

IMPORTANT: Before executing any test steps:

- Verify backend is running on port ${BACKEND_PORT} (see Prerequisites above)
- If backend is not running, the tests MUST NOT proceed - display clear error message
- Frontend dev server will be started automatically by Playwright

Test Execution:

- If using intelligent selection, run the selected E2E test files
- If `e2e_test_file` is provided, read that specific test file
- Digest the `User Story` to first understand what we're validating
- IMPORTANT: Execute the `Test Steps` detailed in the test file(s) using Playwright browser automation
- Review the `Success Criteria` and if any of them fail, mark the test as failed and explain exactly what went wrong
- Review the steps that say '**Verify**...' and if they fail, mark the test as failed and explain exactly what went wrong
- Capture screenshots as specified
- IMPORTANT: Return results in the format requested by the `Output Format`
- Initialize Playwright browser in headed mode for visibility
- Use the determined `application_url` (http://localhost:${FRONTEND_PORT})
- Allow time for async operations and element visibility
- IMPORTANT: After taking each screenshot, save it to `Screenshot Directory` with descriptive names. Use absolute paths to move the files to the `Screenshot Directory` with the correct name.
- Capture and report any errors encountered
- Ultra think about the `Test Steps` and execute them in order
- If you encounter an error, mark the test as failed immediately and explain exactly what went wrong and on what step it occurred. For example: '(Step 1 ❌) Failed to find element with selector "query-input" on page "http://localhost:3001"'
- Use `pwd` or equivalent to get the absolute path to the codebase for writing and displaying the correct paths to the screenshots

## Setup

Read and Execute `.claude/commands/prepare_app.md` now to prepare the application for the test. This will ensure:

- Backend server is running on port ${BACKEND_PORT}
- Database migrations are current
- Backend is healthy and responding to requests

## Screenshot Directory

<absolute path to codebase>/agents/<adw_id>/<agent_name>/img/<directory name based on test file name>/\*.png

Each screenshot should be saved with a descriptive name that reflects what is being captured. The directory structure ensures that:

- Screenshots are organized by ADW ID (workflow run)
- They are stored under the specified agent name (e.g., e2e_test_runner_0, e2e_test_resolver_iter1_0)
- Each test has its own subdirectory based on the test file name (e.g., test_basic_query → basic_query/)

## Report

- Exclusively return the JSON output as specified in the test file
- Capture any unexpected errors
- IMPORTANT: Ensure all screenshots are saved in the `Screenshot Directory`

### Output Format

```json
{
  "test_name": "Test Name Here",
  "status": "passed|failed",
  "screenshots": [
    "<absolute path to codebase>/agents/<adw_id>/<agent_name>/img/<test name>/01_<descriptive name>.png",
    "<absolute path to codebase>/agents/<adw_id>/<agent_name>/img/<test name>/02_<descriptive name>.png",
    "<absolute path to codebase>/agents/<adw_id>/<agent_name>/img/<test name>/03_<descriptive name>.png"
  ],
  "error": null
}
```
