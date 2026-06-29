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

## 커밋 절차

- **커밋 전에, 상세 본문을 포함한 커밋 메시지를 먼저 작성해 확인받고 → 승인받은 메시지 그대로 커밋한다.** (임의로 메시지를 정해 바로 커밋하지 않는다.)

## 브랜치 전략 — GitHub Flow

1인 프로젝트에 맞춘 경량 전략 (정통 Git Flow의 develop/release/hotfix는 미사용).

- **`main`**: 기본 브랜치. 항상 배포 가능한 상태 유지. main 머지 시 자동 배포(아래).
- **feature 브랜치**: 작업은 짧은 수명의 브랜치에서 → PR → `main` 머지.
- **develop 브랜치 없음** (feature+PR로 main 진입을 이미 통제).

### 브랜치 네이밍

`type/짧은-설명` — 작업 대분류가 드러나게 (commit type과 동일 prefix):

```
feat/클릭카메라
fix/레이캐스트-오프셋
docs/plan-갱신
chore/deps
ci/pages-배포
refactor/씬그래프
```

## 푸시 / PR

- 의미 있는 단위로 커밋, feature 브랜치에 push 후 PR 생성.
- PR 제목도 커밋 컨벤션을 따른다.
- 솔로지만 PR을 거쳐 머지 이력을 남긴다 (포트폴리오 신호).

## 배포 (계획 — 아직 미구현)

> 실제 구현은 Phase 0.5에서. 현재는 규칙만 확정.

- **GitHub Actions**로 CI/CD: `main`에 머지되면 → 빌드 → **GitHub Pages 자동 배포**.
- 수동 트리거(`workflow_dispatch`)도 두어 필요 시 수동 배포.
- 공식 GitHub Pages 액션(`actions/upload-pages-artifact` + `deploy-pages`) 사용 예정.
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
