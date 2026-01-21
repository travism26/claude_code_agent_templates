# Review

Follow the `Instructions` below to **review work done against a specification file** (specs/*.md) to ensure implemented features match requirements. Use the spec file to understand the requirements and use git diff to understand the changes made. If there are issues, report them; if not, report success.

## Variables

adw_id: $ARGUMENT
spec_file: $ARGUMENT
agent_name: $ARGUMENT if provided, otherwise use 'review_agent'

## Instructions

- Check current git branch using `git branch` to understand context
- Run `git diff origin/main` to see all changes made in current branch. Continue even if there are no changes related to the spec file.
- Find the spec file by looking for specs/*.md files in the diff that match the current branch name
- Read the identified spec file to understand requirements
- IMPORTANT: We're reviewing a CLI tool implementation. Focus on:
  - Code correctness and adherence to spec
  - Proper error handling
  - Test coverage
  - CLI command behavior matches expectations
  - Proper Go patterns and conventions
- IMPORTANT: Issue Severity Guidelines
  - Think hard about the impact of the issue on the feature and the user
  - Guidelines:
    - `skippable` - the issue is non-blocker for the work to be released but is still a problem
    - `tech_debt` - the issue is non-blocker for the work to be released but will create technical debt that should be addressed in the future
    - `blocker` - the issue is a blocker for the work to be released and should be addressed immediately. It will harm the user experience or will not function as expected.
- IMPORTANT: Return ONLY the JSON object with review results
  - IMPORTANT: Output your result in JSON format based on the `Report` section below.
  - IMPORTANT: Do not include any additional text, explanations, or markdown formatting
  - We'll immediately run JSON.parse() on the output, so make sure it's valid JSON
- Ultra think as you work through the review process. Focus on the critical functionality and code quality.

## Validation Steps

To validate the implementation, run:

1. `go build ./...` - Verify compilation
2. `go test ./...` - Run all tests
3. `go vet ./...` - Static analysis
4. Test relevant CLI commands manually if applicable

## Report

- IMPORTANT: Return results exclusively as a JSON object based on the `Output Structure` section below.
- `success` should be `true` if there are NO BLOCKING issues (implementation matches spec for critical functionality)
- `success` should be `false` ONLY if there are BLOCKING issues that prevent the work from being released
- `review_issues` can contain issues of any severity (skippable, tech_debt, or blocker)
- This allows subsequent agents to quickly identify and resolve blocking errors while documenting all issues

## Review Issues File

- If there are ANY issues found (regardless of severity), create a review issues file:
  - Create the directory `specs/review_issues/` if it doesn't exist
  - Create a file named `specs/review_issues/review-{adw_id}.md` where {adw_id} is the workflow ID
  - Use the Write tool to create this file with the following structure:
    ```markdown
    # Review Issues - {adw_id}

    **Spec File:** {spec_file}
    **Review Date:** {current_date}
    **Status:** {PASSED or FAILED based on success field}

    ## Summary

    {review_summary}

    ## Issues Found: {count}

    {For each issue, create a section like:}
    ### Issue #{review_issue_number}: {issue_severity}

    **File:** {file_path}

    **Description:**
    {issue_description}

    **Resolution:**
    {issue_resolution}

    ---
    ```
- If there are NO issues, do NOT create the review issues file

### Output Structure

```json
{
    "success": "boolean - true if there are NO BLOCKING issues (can have skippable/tech_debt issues), false if there are BLOCKING issues",
    "review_summary": "string - 2-4 sentences describing what was built and whether it matches the spec. Written as if reporting during a standup meeting. Example: 'The user authentication module has been implemented with JWT support. The implementation matches the spec requirements for token generation and validation. Minor error handling improvements could be made but all core functionality is working as specified.'",
    "review_issues": [
        {
            "review_issue_number": "number - the issue number based on the index of this issue",
            "file_path": "string - path/to/file.go:line_number",
            "issue_description": "string - description of the issue",
            "issue_resolution": "string - description of the resolution",
            "issue_severity": "string - severity of the issue between 'skippable', 'tech_debt', 'blocker'"
        }
    ],
    "tests_passed": "boolean - whether go test ./... passed",
    "build_passed": "boolean - whether go build ./... passed"
}
```
