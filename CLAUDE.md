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

Adjust per project. Stack decision recorded in `docs/spec/mainspec/overview.md`.

## Workflow

> **[Direct instruction to Claude]**
> When receiving any request to implement code, modify files, or add features,
> **NEVER implement directly**.
> All implementation MUST go through the `/orchestrator` skill.
> If the user asks to build something without using the skill, respond:
> "구현을 시작하려면 `/orchestrator [요청내용]` 으로 실행해주세요."

```
Trivial  → gatekeeper → direct fix
Minor    → gatekeeper → plan-spec → engineer → reviewer → e2e-runner
Major    → gatekeeper → plan-spec → engineer → reviewer → e2e-runner
```

Never skip reviewer or e2e-runner steps for Minor/Major changes.

## Delta Spec

### Canonical Spec (mainspec)
- 프로젝트 전체 구조 스펙은 `docs/spec/mainspec/` 에 보관한다
- 진입점: `overview.md` (전체 아키텍처, 컴포넌트 맵, API 계약, 라우트, 스택)
- **mainspec은 spec 에이전트가 spec.md + tasks.md 작성 직후 생성/업데이트한다**
  - 신규 프로젝트: overview.md 신규 생성
  - 기존 프로젝트: delta 내용을 overview.md에 병합 + Revision History 추가
- **분리 규칙** (overview.md 500줄 초과 시만 적용):
  - 도메인 기준 분리 절대 금지 (auth.md, blog.md 등)
  - 내용 유형 기준으로만 분리: `db-schema.md` / `api-contracts.md` / `config.md` / `types.md`
  - 분리 후 overview.md에 1-2줄 요약 + 참조 링크 유지
- 추후 변경 시 AI는 `docs/spec/mainspec/` 디렉토리 전체를 읽어 프로젝트를 파악한다

### Delta Spec (진행 중)
- In-progress: `docs/spec/[change-name]/`
  - `spec.md` — what this change adds/modifies
  - `tasks.md` — implementation checklist

### Archive
- 완료된 delta: `docs/spec/archive/{classification}-YYYY-MM-DD-[change-name]/`
  - prefix: `major-` / `minor-` (classification 기준)
- archive 시 mainspec은 이미 spec 에이전트가 업데이트한 상태이므로 폴더 이동만 수행

### Trivial
- Trivial 변경 로그: `docs/trivial/YYYY-MM-DD-HH-MM-SS-[summary].md`
- Trivial은 mainspec 업데이트 없이 로그만 기록

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
