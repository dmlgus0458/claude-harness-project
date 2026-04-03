# CLAUDE.md

## Project Overview
Web page development project managed by a multi-agent pipeline.
Handles requests: "build this page", "modify this feature", etc.

## Stack (Default)
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Vitest (unit/integration)
- Playwright (E2E)

Adjust per project. Stack decision recorded in `openspec/config.yaml`.

## Workflow
All requests go through the orchestrator agent pipeline.

```
Trivial  → gatekeeper → direct fix
Minor    → gatekeeper → spec-writer → engineer → tdd-guide → code-reviewer → e2e-runner
Major    → gatekeeper → planner → architect → spec-writer → engineer → tdd-guide → code-reviewer → security-reviewer → e2e-runner
```

Never skip TDD or E2E steps for Minor/Major changes.

## OpenSpec
- Spec files live in `openspec/specs/`
- In-progress changes in `openspec/changes/[change-name]/`
- Archived changes in `openspec/changes/archive/`
- Delta specs are synced to main specs at archive time via `/opsx:sync`

## Pipeline State
- Active state tracked in `.claude/pipeline-state.json`
- On failure: orchestrator reads state file and resumes from failed step
- Never restart full pipeline if a single step fails

## Definition of Done
A task is complete only when ALL pass:
1. Build succeeds
2. Type check passes
3. Unit/integration tests pass (80%+ coverage)
4. E2E tests pass (critical flows 100%)
5. `/opsx:archive` executed

## Code Conventions
- Functions: single responsibility, <30 lines
- Files: <500 lines
- No `any` in TypeScript
- No hardcoded secrets
- `data-testid` attributes on all interactive elements (for E2E)
