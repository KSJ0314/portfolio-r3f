# 진행 상황 (PROGRESS)

> 이 문서는 프로젝트의 현재 진행 상황을 추적합니다. 마지막 업데이트: **2026-07-09**
> 전체 계획은 [PLAN.md](./PLAN.md) 참고.

## 현재 단계

**Phase 2 — 스테이션 + 상호작용 + 미니맵 진행 중** (기능 구현 완료 / 표지판 보류·문서·커밋 남음) → 다음: Phase 3(2D/3D 전환)

## 단계별 상태

> 아트(디자인·모델링·배치)는 의존성 순서로 확정: **아트 디렉션(4) → 맵/환경 베이스(5) → 스테이션 디자인(8)**. 기능은 임시 Box로 먼저 검증.

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 셋업 (Vite+R3F+TS, 테마, 기본 씬, 문서) | 🟢 완료 |
| 0.5 | 배포 파이프라인 (Vercel Git 연동) | 🟢 완료 |
| 1 | 맵 + 클릭 카메라 이동 | 🟢 완료 |
| 2 | 스테이션 + 상호작용 + 미니맵 | 🟡 진행 중 |
| 3 | 2D/3D 전환 (스테이션 활성화·상세) | ⚪ 대기 |
| 4 | 아트 디렉션 확정 (팔레트·룩·에셋 소싱) ☆ | ⚪ 대기 |
| 5 | 맵/환경 베이스 디자인 (바닥·길·경계·최종 배치) ☆ | ⚪ 대기 |
| 6 | Firebase 데이터 레이어 | ⚪ 대기 |
| 7 | 콘텐츠 (Firestore) | ⚪ 대기 |
| 8 | 스테이션 디자인/모델링 (고유 오브젝트·표지판) ☆ | ⚪ 대기 |
| 9 | 프로젝트 인터랙티브 데모 (메인) | ⚪ 대기 |
| 10 | 출력 (인쇄/PDF) | ⚪ 대기 |
| 11 | 방명록 | ⚪ 대기 |
| 12 | 폴리싱 (후처리·낮밤 연출·성능·접근성·SEO) | ⚪ 대기 |
| 13 | 캐릭터 + 페인팅 (후순위) | ⚪ 대기 |

범례: ⚪ 대기 · 🟡 진행 중 · 🟢 완료 · 🔴 막힘/이슈 · ☆ 아트 전용 단계

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
  - **브랜치 전략 확장**: 풀 Git Flow(main+develop+feature, 운영 시 release·hotfix)로 결정, `develop` 브랜치 부트스트랩(main·develop baseline 동기화 + 원격 push)
  - **배포처 결정**: GitHub Pages → Vercel (main=프로덕션 / develop=스테이징 / PR=프리뷰), Phase 0.5에서 연결
- **2026-07-03**
  - **Phase 0.5 — Vercel 배포 연결**: Vercel Git 연동으로 배포 파이프라인 구성 (별도 CI 워크플로 불필요, Vite 자동 감지: build `npm run build` / output `dist`)
  - **환경 매핑 확정**: `main`=프로덕션 / `develop`=스테이징 프리뷰 / PR=자동 프리뷰 (레포 default 브랜치를 프로덕션으로 자동 지정)
  - **프로덕션 라이브 URL**: https://portfolio-r3f-blue.vercel.app/
- **2026-07-07**
  - **Phase 1 — 맵 + 우클릭 카메라 이동** 구현
  - **이동 방식**: 우클릭 홀드로 캐릭터가 목적지로 이동. 누른 동안 매 프레임 커서 밑 바닥 지점을 레이캐스트해 목표점 갱신 → 커서가 정지해 있어도(카메라가 따라가며 월드가 밀리므로) 계속 이동, 떼면 정지. 좌클릭은 인터랙션용 예약. 거리와 무관한 **고정 속도**(매 프레임 step).
  - **카메라**: 캐릭터와의 상대 오프셋(아이소메트릭 각도·거리)을 고정한 채 매 프레임 캐릭터를 따라가 **화면 중앙 고정**(캐릭터 팔로우). 원근 제거 위해 **Orthographic 카메라**(zoom 기반) 채택 — 춘식이식 평면 아이소메트릭 뷰.
  - **월드/경계**: 임시 진한 초록 바닥(테스트 가시성) + 테스트용 격자(drei `Grid`, raycast 제외). 이동 범위를 `CAMERA_BOUNDS`로 clamp → 경계에서 투명 벽처럼 정지, 맵을 크게 둬 가장자리 미노출. 저폴리/파스텔 디자인·텍스처는 후속(바닥 전체 적용 예정).
  - **컴포넌트 구조**:
    - `src/state/useCameraStore.ts` — 공유 상태(position/target/setTarget, 경계 clamp)
    - `src/scene/CameraRig/` — 카메라 팔로우(오프셋 유지 + lookAt)
    - `src/scene/Character/` — 임시 캐릭터(박스) + 매 프레임 고정 속도 이동
    - `src/scene/World/` — 바닥·격자 + 우클릭 입력·레이캐스트
    - `Experience` — Orthographic Canvas + 우클릭 메뉴 차단, 임시 박스·OrbitControls 제거
  - **트러블슈팅**: 새로고침 시 가끔 맵 미표시 — 오프셋 초기화를 passive `useEffect`로 해 첫 `useFrame`이 먼저 돌면 offset이 (0,0,0)으로 굳어 카메라가 원점에 박히는 레이스. `useLayoutEffect`(첫 프레임보다 먼저 실행) + `ready` 가드로 해결.
- **2026-07-09**
  - **Phase 2 — 스테이션 + 상호작용 + 미니맵** 구현 (표지판 렌더는 아트 단계로 보류)
  - **스테이션 데이터**(`src/content/stations.ts`): 섹션(About/Projects/Guestbook) + 스테이션 7개(About 3 · 프로젝트 플레이스홀더 3 · Guestbook 1) + 표지판·HUB. 겉모습·상세는 데이터가 아니라 `id→전용 컴포넌트` 레지스트리 담당(임시 배치 좌표, 이후 조정).
  - **렌더 + 근접 판정**(`src/scene/Stations/`): `Stations`가 매 프레임 `useFrame`으로 캐릭터-스테이션 근접(반경 3) 판정 → `nearId`. `Station`은 정적 박스 + 라벨(drei `Html`) + 좌클릭 선택. 시각 연출(떠오름 등)은 넣지 않음 — 각 스테이션 고유 오브젝트로 이후 교체.
  - **상호작용 상태**(`src/state/useStationStore.ts`): `nearId`/`activeId`. **선택은 근접한 스테이션에만** 가능하고, 근접 범위를 벗어나면 자동 해제.
  - **미니맵**(`src/ui/Minimap/`): 원형·플레이어 중심·주변 16유닛 표시. 화면 각도에 맞춰 회전(하드코딩 아님 — 카메라에서 유도한 `viewAngle` 사용), 스테이션 short 라벨·근접/선택 표시. 이동은 rAF로 마커만 갱신(리렌더 없음).
  - **개발용**: `DebugHUD`(dev 전용, `import.meta.env.DEV`) — pos/target/speed/view/near/active. 카메라 스토어에 `viewAngle`(CameraRig가 유도)·`motion.speed`(Character가 기록) 추가.
  - **트러블슈팅**: 근접 판정이 안 되던 문제 = **Vite HMR로 R3F `useFrame` 콜백이 낡아 멈춘 것**(코드는 정상, 개발 서버 재시작/하드리프레시로 해결). react-dom rAF로 우회했다가 원인 확정 후 정통 R3F(`Stations` `useFrame`)로 원복.
  - **트러블슈팅**: import 빨간줄 = 폴더 케이싱 충돌(`src/scene/stations` vs `Stations`, TS1261). 폴더를 PascalCase `Stations`로 통일 + 불필요 `.gitkeep` 제거.
  - **설계 문서 정비**: "스테이션=고유 3D 오브젝트+제자리 활성화" 모델로 PLAN/ARCHITECTURE/DESIGN/DECISIONS(006) 갱신. 아트(디자인·모델링·배치) 의존성 순서를 로드맵에 명시 — 아트 디렉션(4)→맵/환경(5)→스테이션 디자인(8), 번호 재정렬(총 13단계).

## 다음 할 일

1. Phase 3 — 2D/3D 전환 (스테이션 활성화·상세)
