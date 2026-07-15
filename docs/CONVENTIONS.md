# 컨벤션 (CONVENTIONS)

> 코드·협업 일관성을 위한 규칙 모음.

## 커밋 메시지 (Conventional Commits)

형식: `type(scope): 설명` — **type은 영어, 설명은 한글.**

```
feat: 클릭 이동 카메라 구현
fix: 레이캐스트 좌표 오프셋 보정
docs: PLAN 로드맵 갱신
```

- **type**: `feat`(기능) · `fix`(버그) · `docs`(문서) · `style`(포맷/스타일, 동작 변화 없음) · `refactor`(리팩터링) · `perf`(성능) · `test`(테스트) · `chore`(잡일/설정) · `build`(빌드) · `ci`(CI/CD)
- **scope**: 선택. 영역 표시 (예: `feat(scene): ...`)
- 설명은 간결한 한글, 명령형/명사형으로.
- 본문은 변경 요점을 불릿으로 적는다. 특히 **`docs` 커밋 본문은 "문서별 불릿"** 으로 쓴다 — 예: `- PROGRESS: …`, `- DECISIONS: …`, `- LEARNING: …`.

## 브랜치 전략 — Git Flow

- **`main`**: 프로덕션(라이브). 릴리스된 것만 반영 → Vercel 프로덕션 배포.
- **`develop`**: 통합 브랜치. feature들이 모이는 "다음 릴리스" 상태 → Vercel 스테이징 프리뷰.
- **`feature/*`**: 신규 기능·작업. `develop`에서 분기 → PR → `develop` 머지 후 삭제.
- **`release/*`**: (운영 시작 후) 배포 전 최종 검증·버전 태깅 → `main`(+`develop`) 머지.
- **`hotfix/*`**: (운영 후) 라이브 긴급 수정. `main`에서 분기 → `main`(+`develop`) 머지.

### 개발 단계 규칙 (운영 전)

- 라이브 사용자가 없는 개발 단계에서는 `release`·`hotfix` 미사용.
- 흐름: `feature → develop → main` 직접 승격.
- `release`·`hotfix`는 실제 운영 시작 후 도입.

### 브랜치 네이밍

`feature/<짧은-설명>` (예: `feature/click-camera`, `feature/painting-mode`)

## 푸시 / PR

- **`develop`·`main`에서 직접 커밋하지 않는다.** 모든 변경은 `feature/*` 브랜치 → PR → 머지. (develop은 통합 전용, main은 릴리스 전용)
- 의미 있는 단위로 커밋, feature 브랜치에 push 후 PR 생성.
- 솔로지만 PR을 거쳐 머지 이력을 남긴다 (포트폴리오 신호).

### PR 제목

- 커밋 접두(`type:`) 없이 **내용을 요약한 서술형**으로 쓴다. (Conventional Commits는 커밋 메시지에만 적용)
- 무슨 작업인지 한눈에 들어오게. Phase가 있으면 `(Phase N)`으로 덧붙인다.
- 릴리스 PR은 방향·범위를 담는다. 예: `develop → main 릴리스 (Phase 2·3·4)`.

### PR 본문

고정 틀을 강요하지 않되, 아래 뼈대를 기본으로 한다. 요점은 개조식 불릿, 설명이 필요하면 문단.

- **`## 개요`** — 어느 Phase·무슨 작업인지, 왜 하는지 1~3문장.
- **내용 섹션** — 성격에 맞는 H2로 나눈다:
  - `## 주요 변경` / `## 기능` — 무엇을 만들었는지.
  - `## 버그 수정` — 버그 PR은 `## 원인` → `## 수정`으로 나눠도 좋다.
  - `## 남긴 한계` — 의도적으로 안 한 것·후속으로 미룬 것.
  - 큰 아트/기능 PR은 주제별 H2로 쪼갠다(예: `## 바닥 재질`, `## 폰트`).
  - 관련 설계 결정은 `(DECISIONS NNN)`으로 인라인 참조.
- **`## 검증`**(또는 `## 확인 방법`) — 빌드·타입체크·lint 통과 여부와 개발 서버에서 확인한 절차.
- 문서만 바뀐 PR은 "코드 변경 없음"을 밝힌다.
- CodeRabbit이 본문 아래 "Summary by CodeRabbit"을 자동으로 붙인다(직접 쓰지 않는다).

## 배포 — Vercel (Phase 0.5에서 연결)

- **Vercel** Git 연동으로 자동 CI/CD (별도 Actions 워크플로 불필요).
- 환경 매핑:
  - `main` → **프로덕션** (라이브 URL)
  - `develop` → **스테이징** 프리뷰 URL
  - PR·`release/*` → **자동 프리뷰** URL (배포 전 검증)
- Framework: Vite 자동 감지 (build `npm run build`, output `dist`).
- Firebase 등 환경변수는 Vercel 프로젝트 설정에 주입.
- 레포: **public** (`portfolio-r3f`).

---

## 코드 스타일 (작성 예정)

### 네이밍
_작성 예정_

### 컴포넌트 분리 규칙

각 컴포넌트는 전용 폴더로 분리:

```
ComponentName/
  index.ts                 # re-export (배럴)
  ComponentName.tsx        # 로직/마크업
  ComponentName.styled.ts  # styled-components
  ComponentName.types.ts   # 타입/인터페이스
  (필요 시) .hooks.ts / .constants.ts
```

### import 순서
_작성 예정_

### 스타일 (styled-components)
_작성 예정_
