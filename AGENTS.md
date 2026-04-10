# Agent Team

## Entry Point

`/orchestrator` 스킬로 파이프라인을 시작합니다. 스킬이 대상 프로젝트에 에이전트를 복사한 후 `orchestrator` 에이전트를 호출합니다.

```
/orchestrator [대상경로(선택)] [요청내용]
```

## Agents

| Agent | Role | Scope |
|-------|------|-------|
| **orchestrator** | Pipeline controller. Spawns all other agents in order. | All |
| **gatekeeper** | Classifies request (Trivial/Minor/Major), checks spec conflicts | All |
| **plan-spec** | Stack analysis, architecture decisions, spec.md + tasks.md 생성 | Minor + Major |
| **engineer** | TDD-based implementation following tasks.md | Minor + Major |
| **reviewer** | TDD coverage check/fix → code quality → security (Major only) | Minor + Major |
| **e2e-runner** | Playwright E2E tests for critical user flows | Minor + Major |
| **build-error-resolver** | Build/TypeScript error resolution with minimal changes | On failure |

## Classification

| Level | Criteria | Example |
|-------|----------|---------|
| Trivial | Single element, no behavior change | Color, typo, spacing |
| Minor | Single feature, behavioral change | Button, bug fix, form |
| Major | New page, new API, structural change | Auth system, new route |

## Pipeline

```
Trivial  → gatekeeper → direct fix
Minor    → gatekeeper → plan-spec → engineer → reviewer → e2e-runner
Major    → gatekeeper → plan-spec → engineer → reviewer → e2e-runner
```

## Context Passing Rules
- All inter-agent context passed via files only
- No accumulated conversation context between agents
- State tracked in `pipeline-state.json` (project root)
- Primary handoff: `changes/[name]/tasks.md` → engineer
