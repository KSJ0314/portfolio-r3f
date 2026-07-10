# 아키텍처 (ARCHITECTURE)

> 시스템 구조·데이터 흐름·렌더링 파이프라인 상세. 큰 그림은 [PLAN.md](./PLAN.md) 참고.

## 개요

_작성 예정_

## 씬 그래프 (3D)

현재(Phase 1):

- `Experience` (`<Canvas orthographic>`) — Orthographic 카메라(아이소메트릭 오프셋)·조명(테마 연동)·배경, 우클릭 메뉴 차단.
  - `World` — 임시 바닥(레이캐스트 대상) + 테스트용 격자. 우클릭 홀드 입력으로 목표점(`useCameraStore`) 갱신.
  - `Character` — 임시 캐릭터(박스). 매 프레임 `target`으로 고정 속도 이동, 위치를 `useCameraStore.position`에 반영.
  - `CameraRig` — 캐릭터와의 고정 오프셋 유지하며 매 프레임 따라가 화면 중앙에 둠.

예정: `Stations`(Phase 2) · 스테이션 상세/활성화(Phase 3) · 프로젝트 스테이션(Phase 7) · 스테이션 고유 오브젝트 모델링(Phase 8).

## 상태 관리 (zustand)

- `useThemeStore` — 테마 모드(light/dark) + toggle, 2D·3D 동시 전환.
- `useCameraStore` — 이동 상태: `position`(현재 위치, 좌표만 변경) · `target`(목표점, 경계 clamp) · `setTarget(point)` · 상수 `CAMERA_BOUNDS`.

## 데이터 흐름 (Firestore → UI)

_작성 예정_

## 2D / 3D 브릿지

_작성 예정 (스테이션 오브젝트 제자리 활성화·확장 + 카메라 포커스; 상세가 2D일 때 `<Html transform>`을 한 옵션으로 사용)_

## 렌더링 / 후처리 파이프라인

_작성 예정 (postprocessing, Bloom, 테마 전환)_
