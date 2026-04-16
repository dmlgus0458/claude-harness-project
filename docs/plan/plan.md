# Project Plan: Notion Clone

meta:
  type: web-app
  created: 2026-04-14

## Overview
Notion의 핵심 기능을 직접 구현하며 학습하는 개인용 메모/노트 웹 앱.
1인 사용자를 위한 페이지 기반 콘텐츠 관리 도구.

## Problem Statement
Notion의 주요 기능(페이지 트리, 블록 에디터, 드래그앤드롭 등)을
직접 구현하여 동작 원리를 이해하고, 개인 메모 도구로 실사용한다.

## Target Users
개인 1인 사용자 (개발자 본인)

## Stack
| 항목 | 결정값 |
|------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL (Docker 컨테이너) |
| Auth | 로그인 UI만 존재, 실제 검증 없이 바로 진입 |
| Deployment | Vercel |
| 이모지 | emoji-picker-react |

## Features

### Must-Have
- 페이지 생성 / 삭제 / 이름 변경
- 하위 페이지(중첩 페이지) 무제한 생성
- 사이드바 페이지 트리 네비게이션 (접기/펼치기)
- 블록 에디터 (텍스트, 제목 H1~H3, 불릿 리스트, 번호 리스트, 체크박스, 구분선)
- 드래그앤드롭으로 블록 순서 변경
- 이모지 페이지 아이콘 (emoji-picker-react)
- 페이지 커버 이미지 (URL 입력 또는 기본 프리셋)
- 즐겨찾기/별표 (사이드바 상단 고정)
- 휴지통 (삭제된 페이지 보관 → 복구 또는 영구 삭제)
- 댓글 기능 (페이지 단위 댓글 작성/삭제)

### Should-Have
- 페이지 공유 링크 (공개 URL 생성)
- 전체 텍스트 검색 (페이지 제목 + 블록 내용)
- 다크모드 (시스템 설정 연동 + 수동 토글)
- 키보드 단축키 (/ 커맨드 메뉴, Ctrl+B 굵게 등)
- 이미지 업로드 블록 (로컬 파일 → 서버 저장)

## Out of Scope
- 실시간 멀티유저 협업 (WebSocket 등)
- AI 글쓰기 도우미
- Notion 데이터베이스 뷰 (테이블 / 갤러리 / 캘린더)
- 공개 API 제공
- 외부 서비스 연동 (Slack, Google Drive 등)

## Success Criteria
- [ ] Must-Have 기능 10개 전부 오류 없이 동작
- [ ] Should-Have 기능 5개 전부 오류 없이 동작
- [ ] 사이드바 → 페이지 이동 → 블록 편집 → 저장의 핵심 플로우가 끊김 없이 동작
- [ ] UI/UX가 Notion과 유사한 수준으로 완성 (레이아웃, 인터랙션)
- [ ] Vercel 배포 후 정상 접속 확인

## Technical Constraints
- PostgreSQL 접속 정보(host, port, user, password, db명)는 환경변수로 주입
- 민감 정보는 .env.local에 저장, 절대 커밋하지 않음
- Vercel 환경변수에 동일 값 등록 필요

## Phases
전체 기능을 단일 Phase로 구현 (Phase 구분 없음)
