"""Data types for Travis workflow results."""

from typing import Optional, List, Literal
from pydantic import BaseModel


class TestResult(BaseModel):
    """Individual test result from test suite execution."""

    test_name: str
    passed: bool
    execution_command: str
    test_purpose: str
    error: Optional[str] = None


class ValidationViolation(BaseModel):
    """Individual architectural violation from validation."""

    rule: str
    file: str
    line: Optional[int] = None
    column: Optional[int] = None
    severity: Literal["error", "warning"]
    message: str
    fix_suggestion: Optional[str] = None


class ReviewIssue(BaseModel):
    """Individual review issue found during spec verification."""

    review_issue_number: int
    file_path: Optional[str] = None
    screenshot_path: Optional[str] = None
    screenshot_url: Optional[str] = None
    issue_description: str
    issue_resolution: str
    issue_severity: Literal["skippable", "tech_debt", "blocker"]


class ReviewResult(BaseModel):
    """Result from reviewing implementation against specification."""

    success: bool
    review_summary: str
    review_issues: List[ReviewIssue] = []
    screenshots: List[str] = []
    screenshot_urls: List[str] = []
    tests_passed: Optional[bool] = None
    build_passed: Optional[bool] = None


class DocumentationResult(BaseModel):
    """Result from documentation generation workflow."""

    success: bool
    documentation_created: bool
    documentation_path: Optional[str] = None
    error_message: Optional[str] = None
