---
name: orchestrator
description: 개발 요청에 대해 새 프로젝트 폴더를 생성하고 harness 파이프라인을 실행한다. 기능 추가, 버그 수정, 새 프로젝트 생성 요청 시 사용.
argument-hint: [경로(선택)] [요청내용]
allowed-tools: Bash Read Write Edit
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

## Step 2 — Harness 복사

다음 bash 명령 실행:

```bash
HARNESS="$(pwd)"
TARGET="<Step 1에서 결정된 TARGET_PATH>"

mkdir -p "$TARGET/.claude"

if [ ! -d "$TARGET/.claude/agents" ]; then
  cp -r "$HARNESS/.claude/agents" "$TARGET/.claude/"
  cp "$HARNESS/CLAUDE.md" "$TARGET/CLAUDE.md"
  mkdir -p "$TARGET/changes/archive" "$TARGET/specs" "$TARGET/trivial"
  echo "Harness 셋업 완료: $TARGET"
else
  echo "이미 셋업된 프로젝트, 파이프라인만 실행: $TARGET"
fi
```

## Step 3 — 파이프라인 실행

Agent(orchestrator) 를 아래 메시지로 호출:

```
PROJECT_ROOT: <TARGET_PATH>

요청: <REQUEST>
```
