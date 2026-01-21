#!/usr/bin/env node

/**
 * Architectural Validation Script
 *
 * Runs ESLint with custom architectural rules and outputs violations as JSON.
 * Used by the Travis SDLC validation phase.
 */

const { ESLint } = require('eslint');
const path = require('path');

async function validateArchitecture() {
  try {
    // Check for --include-warnings flag
    const includeWarnings = process.argv.includes('--include-warnings');

    // Create ESLint instance
    const eslint = new ESLint({
      overrideConfigFile: path.join(__dirname, '..', 'eslint.config.js'),
      cwd: path.join(__dirname, '..'),
    });

    // Run ESLint on the src directory
    const results = await eslint.lintFiles(['src/**/*.ts']);

    // Parse results into ValidationViolation format
    const violations = [];

    for (const result of results) {
      for (const message of result.messages) {
        // Skip warnings unless explicitly requested
        if (message.severity === 1 && !includeWarnings) continue;

        violations.push({
          rule: message.ruleId || 'unknown',
          file: path.relative(process.cwd(), result.filePath),
          line: message.line,
          column: message.column,
          severity: message.severity === 2 ? 'error' : 'warning',
          message: message.message,
          fix_suggestion: getFixSuggestion(message),
        });
      }
    }

    // Output as JSON array
    console.log(JSON.stringify(violations, null, 2));

    // Exit with error code if there are any errors (severity 2)
    const hasErrors = violations.some(v => v.severity === 'error');
    process.exit(hasErrors ? 1 : 0);

  } catch (error) {
    console.error(JSON.stringify([{
      rule: 'validation-error',
      file: 'unknown',
      line: null,
      column: null,
      severity: 'error',
      message: `Validation script failed: ${error.message}`,
      fix_suggestion: null,
    }], null, 2));
    process.exit(1);
  }
}

/**
 * Generate a fix suggestion based on the ESLint message
 */
function getFixSuggestion(message) {
  if (!message.ruleId) {
    return null;
  }

  // Custom suggestions based on rule
  if (message.ruleId === 'custom-rules/no-model-in-routes') {
    return 'Replace model import with service import. Routes should only import from services to maintain architectural boundaries.';
  }

  // For other rules, use the message if available
  if (message.fix) {
    return 'ESLint has an automatic fix available.';
  }

  return null;
}

// Run validation
validateArchitecture();
