# Resolve Validation Violation

Fix a specific architectural validation violation using the provided violation details.

## Instructions

1. **Analyze the Violation**
   - Review the rule name, file, line, severity, and message from the `Violation Input`
   - Understand what architectural pattern is being violated
   - Read the fix_suggestion if available

2. **Context Discovery**
   - Read the affected file to understand the current code
   - Identify the specific line(s) causing the violation
   - Understand the intended functionality of the code

3. **Determine Fix Strategy**

   For `custom-rules/no-model-in-routes`:
   - Route files should not import from `../models/`
   - Replace model imports with service imports from `../services/`
   - Update code to use service methods instead of direct model access
   - Example transformation:
     ```typescript
     // Before (violation)
     import { Task } from '../models/Task';

     // After (fixed)
     import { taskService } from '../services/taskService';
     ```

   For other rules:
   - Analyze the ESLint rule message
   - Apply the suggested fix or determine appropriate correction
   - Maintain code functionality while fixing the violation

4. **Apply the Fix**
   - Make minimal, targeted changes to resolve only this violation
   - Ensure the fix maintains the original functionality
   - Follow existing code patterns and style
   - Do not modify unrelated code

5. **Validate the Fix**
   - Re-run validation on just the affected file:
     ```bash
     cd backend && npx eslint <file-path>
     ```
   - Confirm the specific violation is resolved
   - Ensure no new violations were introduced

## Violation Input

$ARGUMENTS

## Report

Provide a concise summary of:
- Violation rule and location
- Root cause of the violation
- Specific fix applied (show before/after if helpful)
- Confirmation that the violation is resolved
