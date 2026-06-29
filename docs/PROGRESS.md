# 진행 상황 (PROGRESS)

> 이 문서는 프로젝트의 현재 진행 상황을 추적합니다. 마지막 업데이트: **2026-06-29**
> 전체 계획은 [PLAN.md](./PLAN.md) 참고.

## 현재 단계

**Phase 0 — 셋업** (진행 중)

## 단계별 상태

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 셋업 (Vite+R3F+TS, 테마, 기본 씬, 문서) | 🟡 진행 중 |
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
- [ ] 환경 확인 (`node -v`, `npm -v`)
- [ ] Vite 스캐폴딩 (React + TS)
- [ ] 의존성 설치 (three, R3F, drei, postprocessing, zustand, gsap, styled-components 등)
- [ ] 기본 폴더 구조
- [ ] ThemeProvider + GlobalStyle + light/dark 테마 토큰
- [ ] 기본 3D 씬 (Canvas + 조명 + 바닥) + 테마 토글 스텁
- [ ] `npm run dev` 구동 확인

## 작업 로그

- **2026-06-29**
  - 전체 기획 확정, PLAN.md 작성
  - 레포 생성 및 git 초기화
  - 문서 폴더(`docs/`) 구성 — PLAN.md 이동, 문서 골격 일괄 생성(PROGRESS/LEARNING/DECISIONS/CONVENTIONS/ARCHITECTURE/FIRESTORE/DESIGN), 루트 README

## 다음 할 일

1. 환경 확인 (`node -v`, `npm -v`)
2. Vite 스캐폴딩
3. 의존성 설치
4. 기본 구조 + 테마 + 기본 씬
