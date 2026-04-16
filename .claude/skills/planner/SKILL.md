---
name: planner
description: 인터랙티브 Q&A를 통해 프로젝트 계획서(docs/plan/plan.md)를 작성한다. 완성된 plan.md는 orchestrator가 자동으로 참조한다.
argument-hint: [프로젝트 간단 설명(선택)]
allowed-tools: Read Write Bash
---

## 목적
반복적인 Q&A를 통해 `docs/plan/plan.md`를 작성한다.
완성된 plan.md는 orchestrator가 파이프라인 실행 시 자동으로 참조한다.

## 실행 규칙
- 한 라운드에 최대 3개 질문만 한다
- 모든 질문을 한꺼번에 던지지 않는다
- 각 라운드가 끝나면 "지금까지 파악한 내용" 요약 후 다음 라운드로 넘어간다
- 사용자 답변에서 파생된 구체적인 후속 질문을 한다
- 불명확한 항목은 절대 가정으로 채우지 않는다

---

## Round 0 — 프로젝트 유형 파악

첫 질문: 어떤 종류의 프로젝트인가?
- 웹 앱 (Next.js, React, Vue 등)
- API 서버 (REST / GraphQL)
- CLI 도구
- 모바일 앱
- 기타

→ 유형에 따라 이후 질문 세트가 달라진다

---

## Round 1 — 핵심 목적 + 스택

### 웹 앱인 경우
아직 모르는 것 위주로 최대 3개 질문:
1. 이 앱이 해결하는 핵심 문제나 목적은?
2. 주요 사용자는 누구인가? (내부 팀 / 일반 사용자 / 특정 역할)
3. 프론트엔드 프레임워크 선호도가 있는가? (없으면 Next.js App Router 제안)

Round 1 답변 후 — 스택 세부 확인 (결정 안 된 것만):
- 스타일링: Tailwind CSS / CSS Modules / styled-components?
- 백엔드/API: 프론트엔드에 포함(Next.js API Route) / 별도 서버 / 기존 API 연동?
- 데이터베이스: 필요한가? 어떤 종류?
- 인증: 필요한가? 어떤 방식?
- 배포 타겟: Vercel / AWS / 기타?

### API 서버인 경우
1. 핵심 목적과 주요 엔드포인트 범위
2. 언어/프레임워크 선호도 (Node.js/Express, Python/FastAPI, Go 등)
3. 인증 방식과 데이터베이스

### CLI 도구인 경우
1. 핵심 목적과 주요 커맨드
2. 언어 선호도
3. 배포/배포 방식 (npm, Homebrew 등)

---

## Round 2 — 기능 범위

최대 3개 질문:
1. 반드시 있어야 하는 기능은? (목록으로 나열해달라)
2. 있으면 좋지만 1차 범위에서 제외해도 되는 기능은?
3. 이번 구현에서 절대 포함하지 않을 것은?

---

## Round 3 — 성공 기준과 제약

최대 3개 질문:
1. 완성됐다고 판단하는 기준은? (측정 가능하게)
2. 기술적 제약이나 기존 시스템 연동이 필요한가?
3. 단계별로 출시할 계획이 있는가? (있으면 Phase 구분)

---

## 충분성 체크 (자동 판단)

다음이 모두 채워졌으면 초안 작성으로 진행:
- [ ] 프로젝트 유형 확정
- [ ] 핵심 목적/문제 명확
- [ ] 주요 사용자 정의됨
- [ ] 스택 결정됨 (또는 기본값 합의)
- [ ] Must-Have 기능 목록 존재
- [ ] Out of Scope 명시
- [ ] 성공 기준 측정 가능하게 정의됨

하나라도 비어있으면 해당 항목만 추가 질문한다. 절대 TBD로 채우지 않는다.

---

## 초안 작성 및 확인

plan.md 초안을 채팅에 마크다운으로 표시한다.
표시 후: "이 내용으로 확정할까요? 수정할 부분이 있으면 말씀해주세요."

수정 요청 → 해당 섹션만 업데이트 → 재표시 → 재확인
확정될 때까지 반복한다.

---

## 파일 저장

확정 후:
1. `pwd` 로 PROJECT_ROOT 확인
2. `docs/plan/` 디렉토리 생성: `mkdir -p docs/plan`
3. `docs/plan/plan.md` 저장

저장 완료 후 안내:
"docs/plan/plan.md 저장 완료.
구현을 시작하려면 요청을 입력해주세요. orchestrator가 plan.md를 자동으로 참조합니다."

---

## plan.md 출력 포맷

```markdown
# Project Plan: [프로젝트명]

meta:
  type: web-app | api | cli | mobile | other
  created: YYYY-MM-DD

## Overview
[1~2문장 요약]

## Problem Statement
[무슨 문제를 해결하는가]

## Target Users
[누가 사용하는가]

## Stack
| 항목 | 결정값 |
|------|--------|
| Framework | [값] |
| Language | [값] |
| Styling | [값 또는 "해당없음"] |
| Database | [값 또는 "없음"] |
| Auth | [값 또는 "없음"] |
| Deployment | [값] |

## Features

### Must-Have
- [기능 1]
- [기능 2]

### Should-Have
- [기능 1]

### Nice-to-Have
- [기능 1]

## Out of Scope
- [항목 1]

## Success Criteria
- [ ] [측정 가능한 기준 1]
- [ ] [측정 가능한 기준 2]

## Technical Constraints
- [제약 1 또는 "없음"]

## Phases
### Phase 1 (MVP)
- [범위]

### Phase 2 (선택)
- [범위]
```

## 절대 하지 말 것
- 모든 질문을 한꺼번에 던지기
- 사용자 답변 없이 가정으로 항목 채우기
- 불명확한 항목을 TBD로 남긴 채 확정하기
- 라운드 요약 없이 바로 다음 질문으로 넘어가기
