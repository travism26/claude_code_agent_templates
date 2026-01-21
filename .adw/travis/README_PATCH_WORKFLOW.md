# Travis Patch Workflow Guide

## Quick Reference

**When review finds issues, use the patch workflow instead of re-running full SDLC.**

## Typical Workflow

### 1. Run Full SDLC (First Time)

```bash
# Create feature with full SDLC
uv run adws/travis/travis_sdlc.py "Add subdomain enumeration command"
```

**Output:**
```
1. Plan:    ✅ SUCCESS
   File: specs/feature-abc12345-subdomain-enumeration.md
2. Build:   ✅ SUCCESS
3. Test:    ✅ SUCCESS
   Passed: 5, Failed: 0, Attempts: 1
4. Review:  ✅ SUCCESS
   Issues: 6
```

### 2. Review Finds Issues

Review creates: `specs/review_issues/review-abc12345.md`

**Example issues:**
- Issue #1: Missing error handling for timeout (blocker)
- Issue #2: Test coverage incomplete (tech_debt)
- Issue #3: Variable naming inconsistent (skippable)
- Issue #4: Missing validation for empty input (blocker)
- Issue #5: Documentation typo (skippable)
- Issue #6: Inefficient loop (tech_debt)

### 3. Fix Issues with Patch Workflow

```bash
# Fix all review issues efficiently
uv run adws/travis/travis_patch.py abc12345
```

**Patch workflow output:**
```
==================================================
  Phase 1: Creating Patch Plan
==================================================

Loaded review issues from: specs/review_issues/review-abc12345.md
Executing patch planning agent...

Create Patch Plan: ✅ SUCCESS
  Plan: specs/patch/patch-abc12345-fix-review-issues.md

==================================================
  Phase 2: Applying Patch
==================================================

Executing patch implementation agent...

Apply Patch: ✅ SUCCESS

==================================================
  Phase 3: Testing
==================================================

Running tests...
All tests passed (5/5)

Testing: ✅ SUCCESS

==================================================
  Phase 4: Re-review
==================================================

Re-reviewing implementation...

Review: ✅ SUCCESS
  Issues: 0

==================================================
  FINAL SUMMARY
==================================================

ADW ID: abc12345
Original Spec: specs/feature-abc12345-subdomain-enumeration.md
Patch Plan: specs/patch/patch-abc12345-fix-review-issues.md

1. Patch:   ✅ SUCCESS
   Plan: specs/patch/patch-abc12345-fix-review-issues.md
2. Test:    ✅ SUCCESS
   Passed: 5, Failed: 0, Attempts: 1
3. Review:  ✅ SUCCESS
   Issues: 0

==================================================
  ✅ PATCH WORKFLOW COMPLETED SUCCESSFULLY
==================================================
```

## Time Savings

| Workflow      | Phases                                | Estimated Time |
| ------------- | ------------------------------------- | -------------- |
| Full SDLC     | Plan → Build → Test → Review          | ~10-15 minutes |
| **Patch**     | **Patch → Test → Review**             | **~3-5 minutes** |
| Time Saved    | Skip planning phase                   | **~60% faster** |

## Advanced Usage

### Custom Test Retries

```bash
# Increase retry attempts for flaky tests
uv run adws/travis/travis_patch.py abc12345 --max-test-retries 5
```

### Skip Re-review

```bash
# Skip re-review if you're confident in fixes
uv run adws/travis/travis_patch.py abc12345 --skip-review
```

### Use Opus Model for Complex Fixes

```bash
# Use more powerful model for complex patches
uv run adws/travis/travis_patch.py abc12345 --model opus
```

### Combine Options

```bash
# Complex fix with opus, more retries, skip re-review
uv run adws/travis/travis_patch.py abc12345 \
  --model opus \
  --max-test-retries 5 \
  --skip-review
```

## Iterative Fixing

If the patch workflow finds new issues during re-review, just run it again:

```bash
# First attempt - fixes most issues but review finds 2 more
uv run adws/travis/travis_patch.py abc12345
# Review: Issues: 2

# Second attempt - fix remaining issues
uv run adws/travis/travis_patch.py abc12345
# Review: Issues: 0
```

Each iteration creates a new patch plan:
- `specs/patch/patch-abc12345-fix-review-issues.md` (first)
- `specs/patch/patch-abc12345-fix-review-issues-2.md` (second)

## When to Use Full SDLC vs Patch

| Situation | Recommended Workflow |
|-----------|---------------------|
| New feature from scratch | Full SDLC (`travis_sdlc.py`) |
| Fix review issues | **Patch** (`travis_patch.py`) |
| Significant architecture change | Full SDLC |
| Address test failures | Patch |
| Fix typos or minor issues | Patch |
| Add new requirements | Full SDLC (need new plan) |

## File Locations

After running patch workflow, you'll find:

```
specs/
├── feature-abc12345-subdomain-enumeration.md  # Original spec
├── review_issues/
│   └── review-abc12345.md                     # Review issues (before patch)
└── patch/
    └── patch-abc12345-fix-review-issues.md    # Patch plan

agents/abc12345/
├── travis_state.json                          # Updated state
├── travis_patch.log                           # Patch workflow log
├── patch_planner/                             # Patch planning agent output
├── patch_implementor/                         # Patch implementation agent output
└── review_agent/                              # Re-review agent output
```

## Troubleshooting

### "Review issues file not found"

```bash
# Error: Review issues file not found: specs/review_issues/review-abc12345.md
```

**Solution:** Run review first:
```bash
uv run adws/travis/travis_review.py abc12345
```

### "No spec file found in state"

```bash
# Error: No spec file found. Run travis_sdlc.py first.
```

**Solution:** The ADW ID doesn't have a previous run. Use full SDLC:
```bash
uv run adws/travis/travis_sdlc.py "Your feature description" abc12345
```

### Tests still failing after patch

```bash
# ⚠️  PATCH COMPLETED WITH TEST FAILURES
```

**Options:**
1. Run patch again (it will create a new patch plan)
2. Investigate test failures manually
3. Increase retry count: `--max-test-retries 5`

## Benefits

✅ **Faster** - Skip planning phase, ~60% time savings
✅ **Focused** - Address only review issues, minimal changes
✅ **Iterative** - Run multiple times until all issues resolved
✅ **Tracked** - Creates patch plan documentation for audit trail
✅ **Automated** - Full test and re-review cycle included
