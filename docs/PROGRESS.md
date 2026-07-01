# 진행 상황 (PROGRESS)

> 이 문서는 프로젝트의 현재 진행 상황을 추적합니다. 마지막 업데이트: **2026-07-01**
> 전체 계획은 [PLAN.md](./PLAN.md) 참고.

## 현재 단계

**Phase 0 — 셋업 완료** → 다음: Phase 0.5(배포 파이프라인) 또는 Phase 1(맵 + 클릭 카메라)

## 단계별 상태

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 셋업 (Vite+R3F+TS, 테마, 기본 씬, 문서) | 🟢 완료 |
| 0.5 | 배포 파이프라인 (GitHub Pages + Actions) | ⚪ 대기 |
| 1 | 맵 + 클릭 카메라 이동 | ⚪ 대기 |
| 2 | 스테이션 + 상호작용 + 미니맵 | ⚪ 대기 |
| 3 | 2D/3D 전환 (벽 + Html transform) | ⚪ 대기 |
| 3.5 | Firebase 데이터 레이어 | ⚪ 대기 |
| 4 | 콘텐츠 (Firestore + 프로젝트 전시 벽) | ⚪ 대기 |
| 4.5 | 프로젝트 인터랙티브 데모 (메인) | ⚪ 대기 |
| 5 | 출력 (인쇄/PDF) | ⚪ 대기 |
| 5.5 | 방명록 | ⚪ 대기 |
| 6 | 폴리싱 | ⚪ 대기 |
| 7 | 캐릭터 + 페인팅 (후순위) | ⚪ 대기 |

범례: ⚪ 대기 · 🟡 진행 중 · 🟢 완료 · 🔴 막힘/이슈

## Phase 0 세부 체크리스트

- [x] 레포 생성 (`git init`)
- [x] PLAN.md 작성
- [x] `docs/` 폴더 + 문서 골격 (PLAN/PROGRESS/LEARNING/DECISIONS/CONVENTIONS/ARCHITECTURE/FIRESTORE/DESIGN) + 루트 README
- [x] 커밋/브랜치(Git Flow)/배포 컨벤션 확정 (CONVENTIONS)
- [x] 첫 커밋(init) + `master`→`main` 변경
- [x] GitHub CLI 설치 + 인증
- [x] GitHub public 레포 생성 + push → https://github.com/KSJ0314/portfolio-r3f
- [x] 환경 확인 (`node -v`, `npm -v`)
- [x] Vite 스캐폴딩 (React + TS)
- [x] 의존성 설치 (three, R3F, drei, postprocessing, zustand, gsap, styled-components 등)
- [x] 기본 폴더 구조
- [x] ThemeProvider + GlobalStyle + light/dark 테마 토큰
- [x] 기본 3D 씬 (Canvas + 조명 + 바닥) + 테마 토글
- [x] `npm run dev` 구동 확인

## 작업 로그

- **2026-06-29**
  - 전체 기획 확정, PLAN.md 작성
  - 레포 생성 및 git 초기화
  - 문서 폴더(`docs/`) 구성 — PLAN.md 이동, 문서 골격 일괄 생성(PROGRESS/LEARNING/DECISIONS/CONVENTIONS/ARCHITECTURE/FIRESTORE/DESIGN), 루트 README
  - 커밋/브랜치(Git Flow)/배포 컨벤션 확정
  - 첫 커밋(init) + `master`→`main`, GitHub CLI 설치, public 레포 생성 + push (https://github.com/KSJ0314/portfolio-r3f)
- **2026-07-01**
  - **환경 & 스캐폴딩**: 환경 확인, Vite(React+TS) 스캐폴딩, 핵심 의존성 설치(three · @react-three/fiber(v9) · drei · postprocessing · zustand · gsap · styled-components), package 이름 `portfolio-r3f`
  - **폴더 구조**: `src/{scene, features, ui, state, lib, content, theme, styles}` 생성
  - **테마**:
    - `src/theme/themes.ts` — light/dark 테마 토큰 (2D 색상 + 3D 씬 색상·조명값 포함)
    - `src/theme/styled.d.ts` — styled-components `DefaultTheme` 타입 보강
    - `src/styles/GlobalStyle.ts` — 전역 리셋 + 테마 배경/글자색 + 전환 애니메이션
    - `src/state/useThemeStore.ts` — zustand 테마 스토어 (mode, toggle)
    - `src/ui/ThemeToggle/` — 테마 토글 버튼 컴포넌트 (index / tsx / styled)
  - **앱 배선**: `src/App.tsx`(ThemeProvider + GlobalStyle + Experience + ThemeToggle), `src/main.tsx`(불필요한 `index.css` import 제거)
  - **기본 3D 씬**: `src/scene/Experience/` — Canvas + ambient/directional 조명(테마 연동) + 바닥 plane + 임시 박스 + 임시 OrbitControls (Phase 1 클릭 이동으로 대체 예정)
  - **트러블슈팅·결정**: `@vitejs/plugin-react` v6가 oxc 사용(`babel` 옵션 없음) 확인 → `babel-plugin-styled-components` 제거, `vite.config.ts` `react()`로 원복
  - **정리**: 미사용 보일러플레이트 삭제(`index.css`·`App.css`·`src/assets/*`·`public/icons.svg`), `index.html`(title `3D Portfolio: SoJung Kim`, lang `ko`), 채워진 폴더 `.gitkeep` 제거

## 다음 할 일

1. Phase 0.5 — 배포 파이프라인 (GitHub Pages + Actions)
2. Phase 1 — 맵 + 클릭 카메라 이동
