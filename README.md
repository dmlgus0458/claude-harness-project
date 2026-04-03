# claude-harness-project

Multi-agent web development project with spec-driven development.

## Quick Start

```bash
# Install OpenSpec
npm install -g @fission-ai/openspec@latest

# Initialize OpenSpec in this project
openspec init
openspec update
```

## How to Use

Tell the orchestrator what you want:

```
"build a user profile page with avatar upload"
"add a dark mode toggle to the navbar"
"fix the login form not showing error messages"
```

The orchestrator handles everything else.

## Pipeline

```
Request
  └─ gatekeeper (classify)
       ├─ Trivial → direct fix → done
       ├─ Minor  → spec-writer → engineer → tdd-guide → code-reviewer → e2e-runner → archive
       └─ Major  → planner → architect → spec-writer → engineer → tdd-guide
                   → code-reviewer → security-reviewer → e2e-runner → archive
```

## Agents

See `AGENTS.md` for full agent descriptions.

## OpenSpec Commands

| Command | Purpose |
|---------|---------|
| `/opsx:propose [name]` | Create spec (auto-run by spec-writer) |
| `/opsx:verify [name]` | Check implementation vs spec |
| `/opsx:archive` | Finalize + sync delta specs |
| `/opsx:sync` | Merge delta specs into main specs |

## Project Structure

```
.claude/
  agents/           ← Agent definitions
  pipeline-state.json ← Active pipeline state
  tmp/              ← Inter-agent file handoffs
openspec/
  specs/            ← Main specifications
  changes/          ← In-progress + archived changes
tests/
  unit/
  integration/
  e2e/
```
