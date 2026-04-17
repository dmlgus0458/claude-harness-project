---
name: agent-orechestrator
description: 개발 요청에 대해 새 프로젝트 폴더를 생성하고 파이프라인을 직접 실행한다. 기능 추가, 버그 수정, 새 프로젝트 생성 요청 시 사용.
argument-hint: [경로(선택)] [요청내용]
allowed-tools: Bash Read Write Edit Agent
---

## Step 1 — 경로와 요청 분리

$ARGUMENTS 를 분석:

- 첫 번째 토큰이 `D:/`, `C:/`, `/` 로 시작하는 절대경로이면
  - TARGET_PATH = 첫 번째 토큰
  - REQUEST = 나머지 텍스트

- 아니면
  - REQUEST = $ARGUMENTS 전체
  - 요청 텍스트에서 핵심 단어를 추출해 영어 kebab-case 이름 생성
  - TARGET_PATH = `$(dirname $(pwd))/<생성된-이름>`

---

## Step 2 — Harness 복사

다음 bash 명령 실행:

```bash
HARNESS="$(pwd)"
TARGET="<Step 1에서 결정된 TARGET_PATH>"

mkdir -p "$TARGET/.claude"

if [ ! -d "$TARGET/.claude/agents" ]; then
  cp -r "$HARNESS/.claude/agents" "$TARGET/.claude/"
  cp -r "$HARNESS/.claude/skills" "$TARGET/.claude/"
  cp "$HARNESS/CLAUDE.md" "$TARGET/CLAUDE.md"

  # DESIGN.md 복사 (존재하는 경우에만)
  [ -f "$HARNESS/DESIGN.md" ] && cp "$HARNESS/DESIGN.md" "$TARGET/DESIGN.md"

  # plan.md 복사 (존재하는 경우에만)
  if [ -f "$HARNESS/docs/plan/plan.md" ]; then
    mkdir -p "$TARGET/docs/plan"
    cp "$HARNESS/docs/plan/plan.md" "$TARGET/docs/plan/plan.md"
  fi

  mkdir -p "$TARGET/docs/spec/archive" "$TARGET/docs/trivial"
  echo "Harness 셋업 완료: $TARGET"
else
  echo "이미 셋업된 프로젝트, 파이프라인만 실행: $TARGET"
fi
```

---

## Step 3 — 파이프라인 직접 실행

이하 로직은 메인 세션에서 직접 실행한다. PROJECT_ROOT = Step 1에서 결정된 TARGET_PATH.

**하위 에이전트 스폰 시 반드시 메시지 첫 줄에 `PROJECT_ROOT: <절대경로>` 포함.**

**Context Rule**: 각 에이전트 완료 후 status(`done/failed/skipped`), 핵심 파일 경로, 플래그(`BLOCK/WARNING/CRITICAL`)만 추출. 전체 리포트 본문은 즉시 폐기.

---

### 3-A. Plan 참조

`{PROJECT_ROOT}/docs/plan/plan.md` 존재 여부 확인:
- 존재하면 → 읽고 내용을 컨텍스트로 유지 (spec 에이전트에 전달)
- 없으면 → 요청만으로 진행

---

### 3-B. State File 확인

`{PROJECT_ROOT}/.claude/pipeline-state.json` 읽기:
- 이전 실패 기록이 있으면 → 해당 스텝부터 재개
- 없으면 → 신규 시작

State 구조:
```json
{
  "request": "원본 요청",
  "classification": "Trivial|Minor|Major",
  "change_name": "kebab-case-name",
  "plan_md": "docs/plan/plan.md | null",
  "steps": {
    "gatekeeper": {
      "status": "pending|done|failed|skipped",
      "started_at": null,
      "completed_at": null,
      "duration_sec": null,
      "tokens": { "input": null, "output": null }
    },
    "spec": {
      "status": "pending|done|failed|skipped",
      "started_at": null,
      "completed_at": null,
      "duration_sec": null,
      "tokens": { "input": null, "output": null }
    },
    "engineer": {
      "status": "pending|done|failed|skipped",
      "started_at": null,
      "completed_at": null,
      "duration_sec": null,
      "tokens": { "input": null, "output": null }
    },
    "reviewer": {
      "status": "pending|done|failed|skipped",
      "started_at": null,
      "completed_at": null,
      "duration_sec": null,
      "tokens": { "input": null, "output": null }
    },
    "e2e-runner": {
      "status": "pending|done|failed|skipped",
      "started_at": null,
      "completed_at": null,
      "duration_sec": null,
      "tokens": { "input": null, "output": null }
    }
  },
  "artifacts": {
    "tasks_md": "",
    "modified_files": [],
    "canonical_target": "",
    "archived_change": "",
    "main_spec": ""
  },
  "summary": {
    "total_duration_sec": null,
    "total_tokens": { "input": null, "output": null, "combined": null },
    "started_at": null,
    "completed_at": null
  }
}
```

**[필수] State 저장 규칙**:
`pipeline-state.json`은 **반드시 bash heredoc으로만** 저장한다. Write/Edit 툴 사용 금지.

```bash
cat > "$PROJECT_ROOT/.claude/pipeline-state.json" << 'STATE_EOF'
{ ... 전체 JSON ... }
STATE_EOF
```

이 규칙은 파이프라인 전체에 걸쳐 예외 없이 적용된다.

---

### 3-C. Step 1 — Gatekeeper

파이프라인 시작 블록 출력 후 Agent(gatekeeper) 스폰:

```
╔══════════════════════════════════════════════╗
║  PIPELINE  {change_name}  [{classification}] ║
╠══════════════════════════════════════════════╣
║  🔄 gatekeeper   running...                 ║
║  ⬜ spec         pending                    ║
║  ⬜ engineer     pending                    ║
║  ⬜ reviewer     pending                    ║
║  ⬜ e2e-runner   pending                    ║
╚══════════════════════════════════════════════╝
```

**스폰 전**: bash로 현재 시각 기록 → `steps.gatekeeper.started_at` / `summary.started_at` 저장
```bash
date -u +"%Y-%m-%dT%H:%M:%SZ"
```

스폰 메시지:
```
PROJECT_ROOT: <TARGET_PATH>

요청: <REQUEST>
```

완료 후 추출:
- `classification`, `conflict`, `change_name`
- `[Tokens]` 라인에서 input/output 숫자 파싱

**완료 시**: bash로 현재 시각 기록 → `steps.gatekeeper.completed_at` 저장, `duration_sec` 계산 후 저장

bash heredoc으로 `pipeline-state.json` 즉시 저장 후 블록 재출력:
```
║  ✅ gatekeeper   done  (Xs, ~Xk in / ~Xk out) ║
║  🔄 spec         running...                    ║
...
→ gatekeeper done: <classification> / <change_name>
```

- **Trivial** → gatekeeper 직접 처리, 파이프라인 종료
- **conflict = Potential** → 사용자에게 보고, 승인 대기

---

### 3-D. Step 2 — Spec (Minor + Major)

**스폰 전**: bash로 현재 시각 기록 → `steps.spec.started_at` 저장

Agent(spec) 스폰:

```
PROJECT_ROOT: <TARGET_PATH>

요청: <REQUEST>
분류: <classification>
change_name: <change_name>
plan_md_path: docs/plan/plan.md    ← plan.md 존재 시에만 포함
```

완료 확인 (세 조건 모두 충족해야 함):
- `{PROJECT_ROOT}/docs/spec/{change-name}/spec.md`
- `{PROJECT_ROOT}/docs/spec/{change-name}/tasks.md`
- `{PROJECT_ROOT}/docs/spec/mainspec/overview.md` ← spec 에이전트가 생성/업데이트

mainspec이 없으면 spec 에이전트가 실패한 것으로 간주하고 재스폰.

완료 후 추출:
- `[Tokens]` 라인에서 input/output 숫자 파싱

**완료 시**: bash로 현재 시각 기록 → `steps.spec.completed_at` / `duration_sec` 저장

`artifacts.tasks_md` 및 `artifacts.canonical_target` 저장.
bash heredoc으로 `pipeline-state.json` 즉시 저장 후 블록 재출력.

---

### 3-E. Step 3 — Engineer

**스폰 전**: bash로 현재 시각 기록 → `steps.engineer.started_at` 저장

Agent(engineer) 스폰:

```
PROJECT_ROOT: <TARGET_PATH>

tasks_md: docs/spec/<change-name>/tasks.md
```

완료 후 추출:
- Build 상태 (Pass / Fail)
- 수정된 파일 목록 → `artifacts.modified_files` 저장
- tasks.md 체크 상태 (`all checked` / `not all checked`)
- `[Tokens]` 라인에서 input/output 숫자 파싱

**완료 시**: bash로 현재 시각 기록 → `steps.engineer.completed_at` / `duration_sec` 저장

bash heredoc으로 `pipeline-state.json` 즉시 저장 후 블록 재출력.

- **Build Fail** → 즉시 중단, 정확한 에러와 함께 사용자에게 보고
- **미체크 완료 태스크 존재** → engineer가 수정할 때까지 다음 스텝 진행 금지

---

### 3-F. Step 4 — Reviewer

**스폰 전**: bash로 현재 시각 기록 → `steps.reviewer.started_at` 저장

Agent(reviewer) 스폰:

```
PROJECT_ROOT: <TARGET_PATH>

modified_files: <목록>
tasks_md: docs/spec/<change-name>/tasks.md
classification: <Minor|Major>
```

완료 후 추출: APPROVE / WARNING / BLOCK
- `[Tokens]` 라인에서 input/output 숫자 파싱

**완료 시**: bash로 현재 시각 기록 → `steps.reviewer.completed_at` / `duration_sec` 저장

- **BLOCK** → 파이프라인 중단, 구체적인 이슈 사용자에게 보고
- **WARNING** → 사용자에게 보고 후 계속 여부 확인

bash heredoc으로 `pipeline-state.json` 즉시 저장 후 블록 재출력.

---

### 3-G. Step 5 — E2E Runner (Minor + Major)

**스폰 전**: bash로 현재 시각 기록 → `steps.e2e-runner.started_at` 저장

Agent(e2e-runner) 스폰:

```
PROJECT_ROOT: <TARGET_PATH>

change_name: <change_name>
spec_md: docs/spec/<change-name>/spec.md
tasks_md: docs/spec/<change-name>/tasks.md
```

완료 후 추출: Pass / Fail
- `[Tokens]` 라인에서 input/output 숫자 파싱

**완료 시**: bash로 현재 시각 기록 → `steps.e2e-runner.completed_at` / `duration_sec` 저장

**출력에 `[Tests]: N written, N passed, N failed` 라인이 없으면 → Failed로 처리**

bash heredoc으로 `pipeline-state.json` 즉시 저장 후 블록 재출력.

---

### 3-H. Step 6 — Archive (자동, 모든 스텝 done 후)

1. `docs/spec/{change-name}/tasks.md` 미체크 완료 항목 없는지 확인
2. `docs/spec/mainspec/overview.md` 존재 확인 (spec 에이전트가 Step E에서 생성했어야 함)
   - 없으면 → **파이프라인 오류**: spec 에이전트가 mainspec을 생성하지 않음
     사용자에게 보고 후 중단. (spec 에이전트 재스폰으로 복구)
3. archive 폴더명 결정: `{classification}-YYYY-MM-DD-{change-name}`
   - classification 값: `major` / `minor`
4. 폴더 이동:
   ```bash
   mv {PROJECT_ROOT}/docs/spec/{change-name} {PROJECT_ROOT}/docs/spec/archive/{classification}-YYYY-MM-DD-{change-name}
   ```
5. `summary` 합산 후 bash heredoc으로 `pipeline-state.json` 최종 저장:
   - `summary.completed_at` = 현재 시각
   - `summary.total_duration_sec` = 모든 스텝 `duration_sec` 합산
   - `summary.total_tokens.input` = 모든 스텝 `tokens.input` 합산
   - `summary.total_tokens.output` = 모든 스텝 `tokens.output` 합산
   - `summary.total_tokens.combined` = input + output 합계

완료 블록 출력:
```
╔══════════════════════════════════════════════════════════════╗
║  PIPELINE  {change_name}  [{classification}]                 ║
╠══════════════════════════════════════════════════════════════╣
║  ✅ gatekeeper   done    Xs   ~Xk in / ~Xk out              ║
║  ✅ spec         done    Xs   ~Xk in / ~Xk out              ║
║  ✅ engineer     done    Xs   ~Xk in / ~Xk out              ║
║  ✅ reviewer     done    Xs   ~Xk in / ~Xk out              ║
║  ✅ e2e-runner   done    Xs   ~Xk in / ~Xk out              ║
╠══════════════════════════════════════════════════════════════╣
║  Total   Xs   ~Xk tokens in / ~Xk tokens out (~Xk combined) ║
╚══════════════════════════════════════════════════════════════╝
Pipeline complete. Archived → docs/spec/archive/{classification}-YYYY-MM-DD-{change-name}/
Mainspec → docs/spec/mainspec/overview.md
```

---

## 실패 처리

- 스텝 실패 시: `pipeline-state.json`에 `failed` + 에러 요약 기록
- 사용자에게 보고:
  1. 실패 스텝
  2. 정확한 에러
  3. 구체적인 해결 방법
  4. "retry this step" / "abort pipeline" 선택지 제시
- 사용자 응답 대기 후 진행
- 전체 파이프라인 재시작 금지
- 모든 스텝이 done이 아닌 상태에서 아카이브 금지

---

## 절대 하지 말 것

- 구현 코드 직접 작성 또는 수정
- 아키텍처 결정
- 사용자 승인 없는 스텝 건너뜀
- `[Tests]: N written, N passed, N failed` 없이 e2e-runner를 done 처리
- skipped가 자동 자기 보고된 필수 스텝(engineer, reviewer, e2e-runner)은 failed로 처리
