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

- **`develop`·`main`에서 직접 커밋하지 않는다.** 모든 변경은 `feature/*` 브랜치에서 작업 → PR → 머지. (develop은 통합 전용, main은 릴리스 전용)
- 의미 있는 단위로 커밋, feature 브랜치에 push 후 PR 생성.
- PR 제목도 커밋 컨벤션을 따른다.
- 솔로지만 PR을 거쳐 머지 이력을 남긴다 (포트폴리오 신호).

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
