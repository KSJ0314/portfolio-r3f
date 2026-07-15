# 아키텍처 (ARCHITECTURE)

> 시스템 구조·데이터 흐름·렌더링 파이프라인 상세. 큰 그림은 [PLAN.md](./PLAN.md) 참고.

## 개요

_작성 예정_

## 씬 그래프 (3D)

현재(Phase 5):

- `Experience` (`<Canvas orthographic>`) — Orthographic 카메라(아이소메트릭 오프셋)·조명(테마 연동)·배경, 우클릭 메뉴 차단.
  - `World` — 모눈종이 바닥(PaperGround, 레이캐스트 대상). 우클릭 홀드 입력으로 목표점(`useCameraStore`) 갱신. 스테이션이 활성 상태면 우클릭이 종료 트리거가 된다.
  - `Stations` — 스테이션 배치 + 매 프레임 근접 판정(`nearId`) + 좌클릭 활성화(캔버스 `mousedown`을 직접 듣고 레이캐스트).
    - `Station` — 임시 박스 + 이름 라벨. `userData.stationId`만 실어둔다(클릭 판정은 `Stations`가 함).
  - `Character` — 임시 캐릭터(박스). 매 프레임 `target`으로 고정 속도 이동, 위치를 `useCameraStore.position`에 반영. 이동 잠금 중에는 목표점을 현재 위치로 스냅해 멈춘다.
  - `CameraRig` — 캐릭터와의 고정 오프셋 유지하며 매 프레임 따라가 화면 중앙에 둠. 스테이션이 활성화되면 팔로우를 멈춰 카메라 제어권을 넘기고, 닫히면 복귀시킨다.
  - `ActiveStationScene` — 활성 스테이션의 3D 상세 마운트 자리(레지스트리에 등록된 `Scene`).

Canvas 밖(`App`): `StationLifecycle` — 2D 상세 마운트 자리(`Overlay`) + ESC 종료 + 미구현 스테이션 fallback. `Minimap` · `ThemeToggle` · `DebugHUD`(dev 전용).

예정: 프로젝트 스테이션(Phase 9) · 스테이션 고유 오브젝트 모델링·표지판(Phase 8).

## 상태 관리 (zustand)

- `useThemeStore` — 테마 모드(light/dark) + toggle, 2D·3D 동시 전환.
- `useCameraStore` — 이동 상태: `position`(현재 위치, 좌표만 변경) · `target`(목표점, 경계 clamp) · `setTarget(point)` · `viewAngle`(CameraRig가 유도, 미니맵이 사용) · `motion.speed`(디버그용) · 상수 `CAMERA_BOUNDS`.
- `useStationStore` — 스테이션 상호작용: `nearId`(근접) · `activeId` · `phase`(`idle`/`entering`/`active`/`exiting`) · `pendingTarget`(종료 후 이동할 지점) · `activate` · `enterComplete` · `requestClose` · `exitComplete`. 이동 잠금 여부는 `isMovementLocked(phase)`로 판단(애니메이션 재생 중에만 잠김).

## 데이터 흐름 (Firestore → UI)

_작성 예정_

## 2D / 3D 브릿지

스테이션 활성화는 공통층이 라이프사이클만 관리하고, 상세와 카메라 연출은 스테이션마다 따로 구현한다. (DECISIONS 007)

**라이프사이클**

```text
idle ──근접 + 좌클릭──> entering ──enterComplete()──> active
                       [이동 잠금]                     │
                                     우클릭 · ESC ─────┘
                                          ↓
                       exiting ──exitComplete()──> idle
                       [이동 잠금] → 끝나는 순간 우클릭했던 지점으로 출발
```

- 이동 잠금은 애니메이션 재생 중(`entering`·`exiting`)에만 걸린다. `active`에서는 이동 입력을 받고, 그 입력이 곧 종료 트리거다.
- 좌클릭은 상세 내부 요소 상호작용 전용이라 닫기에 쓰지 않는다.

**레지스트리** (`src/features/stations/registry.ts`)

`스테이션 id → { Scene?, Overlay? }`. `Scene`은 Canvas 안(3D), `Overlay`는 Canvas 밖(DOM)에 마운트된다. 상세가 2D면 `Overlay`로 DOM 패널을 그리거나 `Scene` 안에서 drei `<Html transform>`을 쓸 수 있고, 3D면 `Scene`에서 직접 그린다. 공통 셸이나 기본 구현체는 두지 않는다.

**계약**

- 스테이션 구현은 `phase`를 props로 받아 진입·종료 애니메이션을 재생하고, 끝나면 `enterComplete()`/`exitComplete()`로 알린다. 알리지 않으면 잠금이 풀리지 않는다.
- 활성화되는 동안 **카메라 제어권은 스테이션 구현에 있다**(`CameraRig`가 팔로우를 멈춘다). gsap 트윈이든 `useFrame`이든 자유롭게 쓰되 언마운트 시 자기 트윈을 정리해야 한다.
- **복귀는 공통층이 보장한다.** 카메라를 어디에 두고 끝내도 팔로우가 재개되며 원래 오프셋·zoom으로 돌아온다.
- 등록된 구현이 없는 스테이션은 알릴 주체가 없으므로 `StationLifecycle`이 진입·종료를 즉시 완료 처리한다.

## 렌더링 / 후처리 파이프라인

_작성 예정 (postprocessing, Bloom, 테마 전환)_
