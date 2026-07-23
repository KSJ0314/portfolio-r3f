# 아키텍처 (ARCHITECTURE)

> 시스템 구조·데이터 흐름·렌더링 파이프라인 상세. 큰 그림은 [PLAN.md](./PLAN.md) 참고.

## 개요

_작성 예정_

## 씬 그래프 (3D)

현재(Phase 8 진행 중):

- `Experience` (`<Canvas orthographic>`) — Orthographic 카메라(아이소메트릭 오프셋)·조명(테마 연동)·배경, 우클릭 메뉴 차단. 카메라 초기 위치는 `CHARACTER_START`에 아이소메트릭 오프셋을 더한 값이다.
  - `SceneErrorBoundary` — 씬 콘텐츠를 감싸는 안전망. 하위 렌더 중 던져진 에러(텍스처 로드 최종 실패 등)를 잡아 앱 전체가 언마운트되는 것을 막는다. 각 컴포넌트가 스스로 실패를 처리하는 게 먼저이고 이건 마지막 방어선이다.
    - `World`(자체 `Suspense`) — 모눈종이 바닥(PaperGround, 레이캐스트 대상). 우클릭 홀드 입력으로 목표점(`useCameraStore`) 갱신. 스테이션이 활성이어도 이동은 그대로 받는다.
    - `Character` — 임시 캐릭터(박스). 매 프레임 `target`으로 고정 속도 이동, 위치를 `useCameraStore.position`에 반영. 이동 잠금 중에는 목표점을 현재 위치로 스냅해 멈춘다.
    - `CameraRig` — 캐릭터와의 고정 오프셋 유지하며 매 프레임 따라가 화면 중앙에 둠. 오프셋은 한 번만 잡아 `useCameraStore.followOffset`에 기록한다(스테이션이 복귀 자세를 계산할 때 쓴다). 스테이션이 활성화되면 팔로우를 멈춰 카메라 제어권을 넘기고, 닫히면 복귀시킨다.
    - **스테이션 콘텐츠(`Suspense`로 묶음)** — 스테이션 구현이 텍스처를 `useLoader`로 불러오다 suspend해도 그 로딩이 씬 전체가 아니라 여기까지만 미치게 한다.
      - `Stations` — 스테이션 배치 + 매 프레임 근접 판정(`nearId`) + 좌클릭 활성화(캔버스 `mousedown`을 직접 듣고 레이캐스트). 거리 재는 법은 스테이션이 등록한 `distanceTo`를 쓰고, 없으면 배치 좌표까지의 거리로 잰다.
        - `Station` — 레지스트리에 비활성 구현(`Inactive`)이 있으면 그것을 그리고, 없으면 임시 박스 + 이름 라벨을 그린다. 클릭 판정 대상은 `userData.stationId`를 실은 오브젝트다(판정은 `Stations`가 함).
      - `ActiveStationScene` — 활성 스테이션의 3D 상세 마운트 자리(레지스트리에 등록된 `Scene`).

Canvas 밖(`App`): `StationLifecycle` — 2D 상세 마운트 자리(`Overlay`) + ESC 종료 + 미구현 스테이션 fallback. `Minimap` · `DebugHUD`(dev 전용) · `GridPaperHUD`·`IntroPageHUD`(dev 전용 leva 튜닝 패널, 패널 자체는 `GridPaperHUD`가 그리고 나머지는 폴더로 얹힌다).

테마 토글은 밤 테마를 제대로 구현할 때(Phase 10) 다시 단다. 컴포넌트(`ui/ThemeToggle`)와 스토어는 그대로 있다.

예정: 나머지 스테이션의 비활성 상태·활성 연출(Phase 8) · 인쇄 문서(Phase 9).

## 상태 관리 (zustand)

- `useThemeStore` — 테마 모드(light/dark) + toggle, 2D·3D 동시 전환.
- `useCameraStore` — 이동 상태: `position`(현재 위치, 좌표만 변경) · `target`(목표점, 경계 clamp) · `setTarget(point)` · `viewAngle`(CameraRig가 유도, 미니맵이 사용) · `followOffset`(카메라 − 캐릭터, CameraRig가 기록) · `motion.speed`(디버그용) · 상수 `CAMERA_BOUNDS` · `CHARACTER_START`.
- `useStationStore` — 스테이션 상호작용: `nearId`(근접) · `activeId` · `phase`(`idle`/`entering`/`active`/`exiting`) · `setNear` · `activate` · `enterComplete` · `requestClose` · `exitComplete`. 초기값은 `about-intro`가 `active`인 상태다(사이트 첫 화면). `setNear`는 활성 스테이션에서 멀어지면 그대로 종료를 건다. 이동 잠금 여부는 `isMovementLocked(phase)`로 판단(진입 애니메이션 중에만 잠김).
- `useIntroPageStore` — Intro 페이지의 개발용 튜닝 상태(영역·배치·테두리 표시). 프로덕션에는 HUD가 없어 항상 기본값이다.

## 데이터 흐름 (Firestore → UI)

_작성 예정_

## 2D / 3D 브릿지

스테이션 활성화는 공통층이 라이프사이클만 관리하고, 상세와 카메라 연출은 스테이션마다 따로 구현한다. (DECISIONS 007)

**라이프사이클**

```text
idle ──근접 + 좌클릭──> entering ──enterComplete()──> active
                       [이동 잠금]                     │
                       근접 이탈 · 나가기 요소 · ESC ──┘
                                          ↓
                       exiting ──exitComplete()──> idle
```

- 이동 잠금은 `entering`에만 걸린다. `active`에서는 평소처럼 이동할 수 있고, **걸어서 근접 범위를 벗어나는 것이 곧 닫기**다. 종료 중에도 이동을 막지 않는다 — 걸어나가다 멈칫하지 않게.
- 나가기 UI(버튼·화살표 등)는 스테이션 구현이 각자 제공한다. 공통층은 자리도 모양도 정해주지 않는다.
- 우클릭은 순수하게 이동이고, 좌클릭은 상세 내부 요소 상호작용 전용이다.

**레지스트리** (`src/features/stations/registry.ts`)

`스테이션 id → { Inactive?, distanceTo?, Scene?, Overlay? }`.

- `Inactive` — 평소(비활성) 모습. 스테이션 위치에 **상시 마운트**된다. 등록하지 않으면 공통 임시 박스가 그려진다.
- `distanceTo` — 근접 판정에 쓸 거리 계산. 스테이션마다 영역 모양이 다르므로 계산을 맡긴다(영역 안이면 0). 등록하지 않으면 공통층이 배치 좌표까지의 거리로 잰다.
- `Scene`·`Overlay` — 활성화되는 동안만 마운트된다. `Scene`은 Canvas 안(3D), `Overlay`는 Canvas 밖(DOM)이다. 상세가 2D면 `Overlay`로 DOM 패널을 그리거나 `Scene` 안에서 drei `<Html transform>`을 쓸 수 있고, 3D면 `Scene`에서 직접 그린다. 공통 셸이나 기본 구현체는 두지 않는다.

**계약**

- 스테이션 구현은 `phase`를 props로 받아 진입·종료 애니메이션을 재생하고, 끝나면 `enterComplete()`/`exitComplete()`로 알린다. 알리지 않으면 잠금이 풀리지 않는다.
- 활성화되는 동안 **카메라 제어권은 스테이션 구현에 있다**(`CameraRig`가 팔로우를 멈춘다). gsap 트윈이든 `useFrame`이든 자유롭게 쓰되 언마운트 시 자기 트윈을 정리해야 한다.
- **복귀는 공통층이 보장한다.** 카메라를 어디에 두고 끝내도 팔로우가 재개되며 원래 오프셋·zoom으로 돌아온다. 스테이션이 스스로 부드럽게 되돌리려면 `useCameraStore.followOffset`으로 복귀 자세(캐릭터 + 오프셋, 캐릭터를 바라봄)를 계산한다 — **현재 카메라 자세를 보고 유추하면 안 된다.** 팔로우가 아직 한 번도 돌지 않았거나(첫 화면) 이미 스테이션이 카메라를 옮겨둔 뒤라면 그 자세는 항공뷰가 아니다.
- 등록된 구현이 없는 스테이션은 알릴 주체가 없으므로 `StationLifecycle`이 진입·종료를 즉시 완료 처리한다.
- **텍스처는 `setState`로 나중에 주입하지 말고 `useLoader`(Suspense)로 준비 후 주입한다.** 상태로 주입하면 "빈 렌더 → 텍스처 렌더" 한 프레임이 생겨 깜빡인다(LEARNING 2026-07-23). `Stations`·`ActiveStationScene`가 공통 `Suspense` 안에 있어 스테이션이 최상위에서 suspend해도 씬 전체가 아니라 스테이션 콘텐츠까지만 미친다. `CanvasTexture`처럼 런타임에 굽는 것도 `three.Loader`를 상속한 전용 로더로 감싸 `useLoader`에 태운다.

## 렌더링 / 후처리 파이프라인

_작성 예정 (postprocessing, Bloom, 테마 전환)_
