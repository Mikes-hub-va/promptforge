# PromptForge Repo Workflow

This directory is a standalone product repo. Do not mix work from other products here.

## Session Start

1. Run `bash /Users/michael_isa_ai_test/Documents/codex-repo-check.sh .`
2. Confirm the repo root and `origin` match PromptForge before editing.
3. If the user asks for another product, stop and tell them to open that repo in a new Codex chat.

## Branching

- Use `codex/<short-task-name>` for new feature or fix work.
- Keep PromptForge work in this repo only.

## Commit Policy

- Commit after one coherent, testable unit of work.
- Commit before switching repos or starting a risky refactor.
- Stage only relevant files.
- Review `git status --short --branch` before commit.

## Push Policy

- Push when the checkpoint is ready for backup, review, or deployment.
- If the user says `ship it`, `push it`, or `open a PR`, finish verification, commit the relevant files, and push.
- Do not push broken builds or unrelated staged changes.
