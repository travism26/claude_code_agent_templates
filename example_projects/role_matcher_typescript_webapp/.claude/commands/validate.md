# Architectural Validation

Run architectural validation rules using custom ESLint rules and return violations in a standardized JSON format.

## Purpose

Enforce architectural boundaries and coding patterns in the codebase by:

- Checking that routes don't directly import models (use services instead)
- Validating adherence to the service layer pattern
- Identifying violations of custom architectural rules
- Returning actionable violation reports with file:line references

## Variables

VALIDATION_TIMEOUT: 2 minutes

## Instructions

Execute architectural validation and return results as a JSON array of violations.

### Execution Steps

1. Run the following commands to execute both validation scripts in the frontend and backend:

```bash
cd frontend & npm run validate:architecture:json
cd backend & npm run validate:architecture:json
```
   This script:
   - Runs ESLint with custom architectural rules
   - Scans TypeScript files for violations
   - Outputs violations in JSON format

2. **Parse the output**
   - The script outputs a JSON array to stdout
   - Each violation includes: rule, file, line, column, severity, message, fix_suggestion
   - Exit code 0 = no critical violations
   - Exit code 1 = critical violations found

3. **Return results**
   - IMPORTANT: Return ONLY the JSON array with violations
   - Do not include any additional text, explanations, or markdown formatting
   - We'll immediately run JSON.parse() on the output
   - If validation script fails to run, return error as JSON

## Error Handling

If the validation script fails to execute:
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
    "rule": "custom-rules/no-model-in-routes",
    "file": "src/routes/employees.ts",
    "line": 5,
    "column": 1,
    "severity": "error",
    "message": "Routes should not import models directly. Use services instead. Import \"employeeService\" from \"../services/employeeService\" instead.",
    "fix_suggestion": "Replace model import with service import. Routes should only import from services to maintain architectural boundaries."
  },
  {
    "rule": "@typescript-eslint/no-unused-vars",
    "file": "src/routes/tasks.ts",
    "line": 12,
    "column": 7,
    "severity": "warning",
    "message": "'unusedVariable' is assigned a value but never used.",
    "fix_suggestion": null
  }
]
```

## Notes

- Only critical violations (severity: "error") should fail the validation phase
- Warnings (severity: "warning") are informational and don't fail validation
- The validation script automatically categorizes ESLint errors vs warnings
- Focus on custom architectural rules (e.g., no-model-in-routes)
- Standard ESLint rules are included for comprehensive code quality checks
