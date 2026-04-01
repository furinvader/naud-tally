#!/usr/bin/env python3

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent

FENCED_CODE_RE = re.compile(r"(?ms)^(```|~~~).*?^\1[^\n]*$")
INLINE_LINK_RE = re.compile(r"!\[[^\]]*\]\([^)]+\)|\[[^\]]*\]\([^)]+\)")
REFERENCE_LINK_RE = re.compile(r"!\[[^\]]*\]\[[^\]]+\]|\[[^\]]*\]\[[^\]]+\]")
REFERENCE_DEF_RE = re.compile(r"(?m)^\[[^\]]+\]:\s+\S.*$")
AUTOLINK_RE = re.compile(r"<(?:https?://|mailto:)[^>]+>")
INLINE_CODE_RE = re.compile(r"`([^`\n]+)`")
PROSE_CANDIDATE_RE = re.compile(
    r"""
    (?<![A-Za-z0-9_./-])
    (
      (?:\./|\.\./)?(?:[A-Za-z0-9_.-]+/)+[A-Za-z0-9_.-]*/?(?:\#[A-Za-z0-9_.-]+)? |
      (?:[A-Za-z0-9_.-]+\.[A-Za-z0-9_.-]+(?:\#[A-Za-z0-9_.-]+)?) |
      (?:LICENSE|AGENTS\.md|CONTRIBUTING\.md|README\.md|agent-index\.md|\.gitignore|\.nvmrc)
    )
    (?=$|[\s),.:;!?])
    """,
    re.VERBOSE,
)
ROOT_FILE_NAMES = {
    "AGENTS.md",
    "CONTRIBUTING.md",
    "LICENSE",
    "README.md",
    "agent-index.md",
    ".gitignore",
    ".nvmrc",
}


def load_tracked_paths() -> tuple[list[Path], set[str]]:
    result = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=False,
    )
    tracked_files: list[Path] = []
    tracked_paths: set[str] = set()

    for raw_path in result.stdout.decode().split("\0"):
        if not raw_path:
            continue

        rel_path = Path(raw_path)
        tracked_files.append(REPO_ROOT / rel_path)
        tracked_paths.add(rel_path.as_posix())

        for parent in rel_path.parents:
            if parent == Path("."):
                break
            parent_posix = parent.as_posix()
            tracked_paths.add(parent_posix)
            tracked_paths.add(f"{parent_posix}/")

    return tracked_files, tracked_paths


def mask_matches(text: str, regexes: list[re.Pattern[str]]) -> str:
    chars = list(text)

    for regex in regexes:
        for match in regex.finditer(text):
            for index in range(match.start(), match.end()):
                if chars[index] != "\n":
                    chars[index] = " "

    return "".join(chars)


def normalize_token(token: str) -> str:
    normalized = token.strip().strip("\"'()[]{}")
    return normalized.rstrip(".,:;!?")


def looks_like_repo_path(token: str) -> bool:
    return "/" in token or "." in token or token in ROOT_FILE_NAMES


def resolve_repo_path(token: str, source_file: Path, tracked_paths: set[str]) -> bool:
    if not token or " " in token or "://" in token:
        return False

    if any(char in token for char in "*?[]{}<>"):
        return False

    path_part = token.split("#", 1)[0]
    if not path_part:
        return False

    path_part = path_part.rstrip("/")
    if not path_part:
        return False

    attempts = []
    for base in (source_file.parent, REPO_ROOT):
        candidate = (base / path_part).resolve()
        try:
            repo_rel = candidate.relative_to(REPO_ROOT).as_posix()
        except ValueError:
            continue
        attempts.append(repo_rel)

    for attempt in attempts:
        if attempt in tracked_paths or f"{attempt}/" in tracked_paths:
            return True

    return False


def line_and_column(text: str, offset: int) -> tuple[int, int]:
    line = text.count("\n", 0, offset) + 1
    line_start = text.rfind("\n", 0, offset)
    column = offset + 1 if line_start == -1 else offset - line_start
    return line, column


def find_issues(markdown_file: Path, tracked_paths: set[str]) -> list[tuple[int, int, str]]:
    text = markdown_file.read_text(encoding="utf-8")
    masked = mask_matches(
        text,
        [
            FENCED_CODE_RE,
            INLINE_LINK_RE,
            REFERENCE_LINK_RE,
            REFERENCE_DEF_RE,
            AUTOLINK_RE,
        ],
    )

    issues: list[tuple[int, int, str]] = []

    prose_ready = list(masked)

    for match in INLINE_CODE_RE.finditer(masked):
        token = normalize_token(match.group(1))
        if looks_like_repo_path(token) and resolve_repo_path(token, markdown_file, tracked_paths):
            line, column = line_and_column(text, match.start(1))
            issues.append((line, column, token))

        for index in range(match.start(), match.end()):
            if prose_ready[index] != "\n":
                prose_ready[index] = " "

    prose_text = "".join(prose_ready)

    for match in PROSE_CANDIDATE_RE.finditer(prose_text):
        token = normalize_token(match.group(1))
        if resolve_repo_path(token, markdown_file, tracked_paths):
            line, column = line_and_column(text, match.start(1))
            issues.append((line, column, token))

    unique_issues = []
    seen = set()
    for issue in issues:
        if issue in seen:
            continue
        seen.add(issue)
        unique_issues.append(issue)

    return unique_issues


def main() -> int:
    tracked_files, tracked_paths = load_tracked_paths()
    markdown_files = sorted(path for path in tracked_files if path.suffix == ".md")

    failures = []
    for markdown_file in markdown_files:
        issues = find_issues(markdown_file, tracked_paths)
        for line, column, token in issues:
            failures.append(
                f"{markdown_file.relative_to(REPO_ROOT)}:{line}:{column}: "
                f"repo file or directory mention should use a markdown link: {token}"
            )

    if failures:
        print("Found unlinked repo file or directory mentions in markdown:")
        for failure in failures:
            print(failure)
        return 1

    print("Markdown repo-link check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
