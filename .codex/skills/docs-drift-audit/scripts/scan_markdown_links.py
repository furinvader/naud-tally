#!/usr/bin/env python3

from __future__ import annotations

import argparse
import fnmatch
import os
import re
import subprocess
from pathlib import Path


LINK_RE = re.compile(r"(?<!!)\[([^\]]+)\]\(([^)]+)\)")
DEFAULT_EXCLUDES = [".git/**", "frontend/node_modules/**"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scan markdown files for broken local links.",
    )
    parser.add_argument(
        "--root",
        type=Path,
        help="Repository root to scan. Defaults to the Git toplevel or the current directory.",
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument(
        "--tracked-only",
        action="store_true",
        help="Scan tracked markdown files from Git. This is the default mode.",
    )
    mode.add_argument(
        "--all-on-disk",
        action="store_true",
        help="Scan all markdown files on disk under the root, excluding configured globs.",
    )
    parser.add_argument(
        "--exclude-glob",
        action="append",
        default=[],
        help="Additional glob to exclude. May be passed more than once.",
    )
    return parser.parse_args()


def detect_root(requested_root: Path | None) -> Path:
    if requested_root is not None:
        return requested_root.resolve()

    try:
        output = subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except (FileNotFoundError, subprocess.CalledProcessError):
        return Path.cwd().resolve()

    return Path(output).resolve()


def is_excluded(rel_path: str, exclude_globs: list[str]) -> bool:
    return any(fnmatch.fnmatch(rel_path, pattern) for pattern in exclude_globs)


def iter_markdown_files(root: Path, tracked_only: bool, exclude_globs: list[str]) -> list[Path]:
    files: list[Path] = []

    if tracked_only:
        output = subprocess.check_output(
            ["git", "-C", str(root), "ls-files", "--", "*.md"],
            text=True,
        )
        for rel in output.splitlines():
            rel = rel.strip()
            if not rel or is_excluded(rel, exclude_globs):
                continue
            path = root / rel
            if path.exists():
                files.append(path)
        return sorted(files)

    for path in root.rglob("*.md"):
        rel = path.relative_to(root).as_posix()
        if is_excluded(rel, exclude_globs):
            continue
        files.append(path)
    return sorted(files)


def find_broken_links(root: Path, path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8")
    issues: list[tuple[str, str]] = []

    for match in LINK_RE.finditer(text):
        target = match.group(2).strip()
        if (
            not target
            or "://" in target
            or target.startswith("#")
            or target.startswith("mailto:")
        ):
            continue

        target = target.split("#", 1)[0]
        if target.startswith("<") and target.endswith(">"):
            target = target[1:-1]

        resolved = (path.parent / target).resolve()
        if not resolved.exists():
            issues.append((match.group(2), os.path.relpath(resolved, root)))

    return issues


def main() -> int:
    args = parse_args()
    root = detect_root(args.root)
    tracked_only = not args.all_on_disk
    exclude_globs = DEFAULT_EXCLUDES + args.exclude_glob
    files = iter_markdown_files(root, tracked_only=tracked_only, exclude_globs=exclude_globs)
    broken: list[tuple[str, str, str]] = []

    for path in files:
        for raw_target, resolved in find_broken_links(root, path):
            broken.append((path.relative_to(root).as_posix(), raw_target, resolved))

    mode_label = "tracked-only" if tracked_only else "all-on-disk"
    print(f"Root: {root}")
    print(f"Mode: {mode_label}")
    print(f"Markdown files scanned: {len(files)}")
    print(f"Broken local markdown links: {len(broken)}")

    for rel_path, raw_target, resolved in broken:
        print(f"{rel_path} -> {raw_target}  [resolved: {resolved}]")

    return 1 if broken else 0


if __name__ == "__main__":
    raise SystemExit(main())
