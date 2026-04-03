# Agent Team

| Agent | Role | Scope |
|-------|------|-------|
| **orchestrator** | Pipeline controller. Spawns all other agents in order. | All |
| **gatekeeper** | Classifies request (Trivial/Minor/Major), checks spec conflicts | All |
| **planner** | Creates phased implementation plan from requirements | Major |
| **architect** | System design decisions and trade-off analysis | Major |
| **spec-writer** | Runs `/opsx:propose`, generates proposal/specs/design/tasks | Minor + Major |
| **engineer** | TDD-based implementation following tasks.md | Minor + Major |
| **tdd-guide** | Enforces Red-Green-Refactor cycle, 80%+ coverage | Minor + Major |
| **e2e-runner** | Playwright E2E tests for critical user flows | Minor + Major |
| **code-reviewer** | Code quality, security basics, pattern review | Minor + Major |
| **security-reviewer** | OWASP Top 10, vulnerability detection | Major |
| **build-error-resolver** | Build/TypeScript error resolution with minimal changes | On failure |

## Classification

| Level | Criteria | Example |
|-------|----------|---------|
| Trivial | Single element, no behavior change | Color, typo, spacing |
| Minor | Single feature, behavioral change | Button, bug fix, form |
| Major | New page, new API, structural change | Auth system, new route |

## Context Passing Rules
- All inter-agent context passed via files only
- No accumulated conversation context between agents
- State tracked in `.claude/pipeline-state.json`
- OpenSpec artifacts used as primary handoff: `tasks.md` → engineer
