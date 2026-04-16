# claude-harness-project

Multi-agent development pipeline. Spec-driven, TDD-enforced, E2E-gated.

## Usage

하네스 프로젝트에서 `/orchestrator` 스킬을 실행합니다.

```
/orchestrator [대상경로(선택)] [요청내용]
```

| 사용 방식 | 예시 |
|-----------|------|
| 경로 생략 | `/orchestrator 로그인 페이지 만들어줘` |
| 경로 지정 | `/orchestrator D:/projects/my-app 프로필 편집 기능 추가해줘` |

- 경로를 생략하면 요청 내용 기반으로 상위 폴더에 새 프로젝트 폴더를 자동 생성합니다.
- 경로가 이미 존재하면 에이전트를 동기화하고 파이프라인만 실행합니다.

## Pipeline

```
Request
  └─ gatekeeper (분류)
       ├─ Trivial → 직접 수정 → 완료
       ├─ Minor  → plan-spec → engineer → reviewer → e2e-runner → 자동 아카이브
       └─ Major  → plan-spec → engineer → reviewer → e2e-runner → 자동 아카이브
```

## Agents

See `AGENTS.md` for full agent descriptions.

## Project Structure

```
.claude/
  agents/              ← 에이전트 정의
  pipeline-state.json  ← 파이프라인 상태 (자동 생성)
  tmp/                 ← 에이전트 간 파일 핸드오프
specs/                 ← 도메인별 누적 스펙
changes/               ← 진행 중인 변경사항
  [change-name]/
    spec.md            ← 델타 스펙
    tasks.md           ← 구현 체크리스트
  archive/             ← 완료된 변경사항
trivial/               ← Trivial 변경 로그
```
