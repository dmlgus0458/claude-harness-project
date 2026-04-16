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

Adjust per project. Stack decision recorded in `specs/config.md`.

## Workflow

> **[Direct instruction to Claude]**
> When receiving any request to implement code, modify files, or add features,
> **NEVER implement directly**. Always call `Agent(orchestrator)` first.
> Unless the user explicitly says "implement directly" or "skip the pipeline",
> the first tool call for any implementation task MUST be `Agent(orchestrator)`.

```
Trivial  → gatekeeper → direct fix
Minor    → gatekeeper → plan-spec → engineer → reviewer → e2e-runner
Major    → gatekeeper → plan-spec → engineer → reviewer → e2e-runner
```

Never skip reviewer or e2e-runner steps for Minor/Major changes.

## Delta Spec
- Main specs live in `specs/[domain].md` (accumulated knowledge)
- In-progress changes in `changes/[change-name]/`
  - `spec.md` — delta spec (what this change adds/modifies)
  - `tasks.md` — implementation checklist
- Archived changes in `changes/archive/[change-name]/`
- On archive: orchestrator moves folder + appends delta to `specs/[domain].md`
- Trivial change logs in `trivial/YYYY-MM-DD-HH-MM-SS-[summary].md`

## Pipeline State
- Active state tracked in `.claude/pipeline-state.json` (자동 생성)
- On failure: orchestrator reads state file and resumes from failed step
- Never restart full pipeline if a single step fails

## Definition of Done
A task is complete only when ALL pass:
1. Build succeeds
2. Type check passes
3. Unit/integration tests pass (80%+ coverage)
4. E2E tests pass (critical flows 100%)
5. Orchestrator archives the change (auto on pipeline completion)

## Code Conventions
- Functions: single responsibility, <30 lines
- Files: <500 lines
- No `any` in TypeScript
- No hardcoded secrets
- `data-testid` attributes on all interactive elements (for E2E)

## Design System
프로젝트 루트에 `DESIGN.md` 가 존재하면 UI 구현 시 반드시 따른다:
- 색상: `DESIGN.md` Color Palette 외의 값을 하드코딩하지 않는다
- 타이포그래피: Typography Rules 테이블의 font-size·font-weight·letter-spacing만 사용한다
- border-radius: Border Radius Scale 값만 사용한다
- 그림자: Depth & Elevation 시스템의 shadow 스택만 사용한다
- 컴포넌트 스타일: Component Stylings 섹션의 패턴을 따른다
- 빠른 참조는 `DESIGN.md` Section 9 (Agent Prompt Guide)를 활용한다
- `DESIGN.md` 가 없으면 이 규칙은 무시한다
