# 진행 상황 (PROGRESS)

> 이 문서는 프로젝트의 현재 진행 상황을 추적합니다. 마지막 업데이트: **2026-07-16**
> 전체 계획은 [PLAN.md](./PLAN.md) 참고.

## 현재 단계

**Phase 6 — Firebase 데이터 레이어 완료** → 다음: Phase 7(콘텐츠)

## 단계별 상태

> 아트(디자인·모델링·배치)는 의존성 순서로 확정: **아트 디렉션(4) → 맵/환경 베이스(5) → 스테이션 디자인(8)**. 기능은 임시 Box로 먼저 검증.

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 셋업 (Vite+R3F+TS, 테마, 기본 씬, 문서) | 🟢 완료 |
| 0.5 | 배포 파이프라인 (Vercel Git 연동) | 🟢 완료 |
| 1 | 맵 + 클릭 카메라 이동 | 🟢 완료 |
| 2 | 스테이션 + 상호작용 + 미니맵 | 🟢 완료 |
| 3 | 2D/3D 전환 (스테이션 활성화·상세) | 🟢 완료 |
| 4 | 아트 디렉션 확정 (팔레트·룩·에셋 소싱) ☆ | 🟢 완료 |
| 5 | 맵/환경 베이스 (바닥 — Phase 4에 흡수, 나머지 소멸·Phase 8 이관) ☆ | 🟢 완료 |
| 6 | Firebase 데이터 레이어 | 🟢 완료 |
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

- **2026-07-13**
  - **Phase 3 — 2D/3D 전환(스테이션 활성화 프레임워크)** 구현. 상세·연출은 스테이션마다 다르므로 이 단계에선 **판만 깔고 실제 상세는 만들지 않음**.
  - **활성화 라이프사이클**(`src/state/useStationStore.ts`): `idle → entering → active → exiting` 상태 머신. 이동 잠금은 **애니메이션 재생 중(entering·exiting)에만** 걸린다. `active`에서 우클릭은 곧 종료 트리거이고, 클릭 지점(`pendingTarget`)을 기억해뒀다가 **종료 애니메이션이 끝난 뒤** 캐릭터가 그리로 출발한다. ESC로도 종료. 좌클릭은 상세 내부 요소 상호작용 전용이라 닫기에 쓰지 않음.
  - **카메라 제어권 위임**(`CameraRig`): 활성화되면 팔로우를 멈춰 **카메라를 스테이션에 통째로 넘긴다**. 공통층은 어떻게 움직이는지 알지 못하고, 닫힐 때 원래 오프셋·zoom으로 **복귀만 보장**한다. 기본 트윈·선언형 스펙조차 두지 않음 — 있으면 이후 스테이션이 그 틀에 끌려가므로. (DECISIONS 007)
  - **레지스트리**(`src/features/stations/`): `id → { Scene?, Overlay? }`(Canvas 안 3D / Canvas 밖 DOM). 공통 셸·기본 구현체 없음. 마운트 슬롯은 `ActiveStationScene`(Canvas 안)과 `StationLifecycle`(Canvas 밖, ESC 종료 + 미구현 스테이션 즉시 완료 fallback).
  - **계약**: 스테이션 구현이 `phase`를 받아 애니메이션을 재생하고, 끝나면 `enterComplete()`/`exitComplete()`로 공통층에 알린다. `about-intro`에 **임시 뼈대**를 등록해 라이프사이클이 도는지 확인(그리는 것 없이 애니메이션 자리에 1초 지연만).
  - **DebugHUD**: `phase`·`locked`·`camera`(follow/station) 추가. 이 단계 검증은 전부 HUD 상태값으로.
  - **트러블슈팅**: 우클릭 홀드로 이동 중 스테이션 좌클릭이 안 먹힘 = `pointerdown`이 포인터 활성 전환 시에만 발생하는 것이 원인. 우클릭으로 이미 활성이라 좌클릭은 `buttons`만 바뀐 `pointermove`로 옴. R3F 이벤트가 전부 pointer 기반이라 무력 → `Stations`가 캔버스 `mousedown`을 직접 듣고 레이캐스트해 해결.
  - **트러블슈팅**: eslint `react-hooks/immutability`가 `useEffect`/`useFrame` 안에서 훅 반환값(`useThree().camera`)의 프로퍼티 대입(`cam.zoom = …`)을 막음 → `useFrame((state) => …)`이 넘겨주는 `state.camera`를 사용해 해결.
  - **주석 규칙 정리**: 한국어 주석 줄바꿈을 절 경계 기준으로 통일(`src/` 전체). JSDoc은 선언 문서, `//`는 몸통 안 이유 메모로 역할 구분.
  - **남긴 한계**: 평상시 겉모습(`Station`의 임시 박스)과 활성 시 상세 컴포넌트가 분리돼 있어 같은 오브젝트가 이어서 변형되는 연출은 아직 불가. 겉모습 슬롯은 고유 오브젝트를 만드는 Phase 8에서 레지스트리에 추가.

- **2026-07-14**
  - **Phase 4 — 아트 디렉션 확정**. 저폴리 파스텔 마을 → **스케치북**으로 전환 (DECISIONS 008).
  - **컨셉**: 월드는 빈 종이. 마을·나무·집·하늘 없음. 스테이션은 종이 위의 그림이고 활성화하면 3D로 전환되며, 전환 연출은 스테이션마다 따로 만든다. 테마는 조명 색·밝기 변화만(저녁 노을 정도), 네온은 후순위.
  - **바닥(모눈종이)**: 손그림 모눈 텍스처를 코드로 생성해 PNG로 굽고 타일링 (DECISIONS 009). 원래 Phase 5(맵/환경 베이스) 몫이나, 아트 방향을 눈으로 확인하려 앞당겨 완성. 생성 로직·기본값을 `src/lib/gridPaper/`에 두고 스크립트(`scripts/generate-grid-paper.mjs`)와 앱이 함께 쓴다. 심리스는 떨림·농담을 타일 폭의 정수 주기 사인파로만 만들어 보장. 선 굵기·떨림은 칸 크기 대비 비율이라 칸 수만 바꿔도 모양이 유지된다.
  - **개발용 HUD**: leva 도입(`GridPaperHUD`, dev 전용·우하단·접힘). 슬라이더로 텍스처 값을 실시간 조절하고, 조작 중엔 저해상도·멈추면 고해상도로 다시 굽는다. 확정 값은 "값 복사(JSON)" → 상수 반영 → 스크립트로 재생성.
  - **바닥 재질**: 조명을 받지 않는 basic + 톤 매핑 제외 (DECISIONS 010). 조명을 받게 두면 광량이 1에 못 미쳐 흰 종이가 회색으로 찍힌다.
  - **폰트**: 손글씨 감자꽃 + 본문 Pretendard, 둘 다 self-host. 테마에 `fonts` 토큰 추가. 씬 안 3D 텍스트는 웹폰트가 아니라 ttf를 읽으므로 상용 한글 2350자로 서브셋(약 1MB).
  - **맵 좌표 재배치**: 맵 기준 오른쪽=About · 아래=Projects · 왼쪽=Guestbook · 위=빈 공간. 카메라 방위각을 그에 맞춰 돌려 화면 구도(About이 우측 상단)를 유지. 줌 120→85, 고도각 약 42°.
  - **테마 색 정리**: `scene.background`를 하늘색에서 종이 밖 여백으로, 죽은 값이 된 `scene.ground` 제거, UI 배경·테두리를 종이 톤으로.
  - **주석 규칙**: 일기·경위 서술 금지, 짧게, 멀쩡한 어미는 통일한다고 바꾸지 않기 (CLAUDE.md).

- **2026-07-15**
  - **Phase 5 — 맵/환경 베이스 완료 처리.** 실체인 모눈종이 바닥은 Phase 4에서 아트 방향을 눈으로 검증하려 임시 구현하다 완성돼, Phase 5로 새로 할 일이 남지 않는다.
  - **길·경계벽·분위기 소품 소멸**: 스케치북 전환으로 월드는 빈 종이. 길 없이 오픈월드처럼 배치하고, 방향 안내(바닥 화살표·표지판)는 스테이션 실물이 생긴 뒤라야 의미가 있다.
  - **경계벽 불필요**: 기존 `CAMERA_BOUNDS` clamp가 곧 최종. 바닥을 이동범위보다 크게 둬 가장자리가 안 보이므로 별도 물리 경계벽을 두지 않는다 (DECISIONS 005 갱신).
  - **Phase 8 이관**: 스테이션 최종 배치·스케일·표지판·바닥 화살표는 스테이션별 상세 구현에서 각자 정한다.

- **2026-07-16**
  - **Phase 6 — Firebase 데이터 레이어** 구현·연결. 앱↔Firestore 연결과 읽기·쓰기 접근 함수를 이 단계에서 완성. 실제 데이터 입력·화면 연결은 Phase 7.
  - **초기화·데이터 접근**(`src/lib/firebase/`): `initializeApp` + `getFirestore`. 읽기는 커스텀 훅(`useCollection`/`useDoc`, `{ data, loading, error }`), 콘텐츠 5종 입력은 개발용 쓰기 함수(`setDocData`/`addDocData`). 방명록 쓰기·App Check는 Phase 11.
  - **컬렉션 8개**(profile·skills·experiences·education·awards·spec·projects·guestbook): Firestore는 빈 컬렉션을 못 만들어 `scripts/seed-firestore.mjs`가 각 컬렉션에 빈 `_placeholder` 문서를 넣어 생성. config는 `.env.local`에서 읽어 하드코딩 안 함. 필드 설계는 Phase 7.
  - **스테이션 매핑 + 활성화 시 읽기**: 각 스테이션에 읽을 컬렉션을 매핑(`stations.ts`의 `collections`), 활성화되면 `fetchCollection`으로 읽어 콘솔에 확인 출력. 데이터 활용은 스테이션 상세 구현에서(콘솔 출력은 그때까지 유지).
  - **보안 규칙**: 콘솔 관리. 개발 중엔 열린 규칙, 배포 전 잠금(콘텐츠 write 차단, guestbook은 Phase 11) — DECISIONS 011. web config는 공개값이라 env는 비밀이 아니라 환경 분리용.

## 다음 할 일

1. Phase 7 — 콘텐츠 (Firestore에 데이터 입력 + 스테이션 상세·프로젝트 스테이션 연결)
