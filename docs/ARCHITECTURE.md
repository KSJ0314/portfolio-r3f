# 아키텍처 (ARCHITECTURE)

> 시스템 구조·데이터 흐름·렌더링 파이프라인 상세. 큰 그림은 [PLAN.md](./PLAN.md) 참고.

## 개요

_작성 예정_

## 라우팅

`main.tsx` → `BrowserRouter` → `Root`(테마·전역 스타일 공유) → 라우트 두 개.

- `/` — 3D 포트폴리오(`App`). 아래 씬 그래프가 여기다.
- `/crayon` — 크레파스 스튜디오 단독 페이지(`tools/CrayonStudio`). 맵 없이 그림판만 띄운다. 배포본에도 포함돼 방문자가 크레파스로 그려 PNG로 저장할 수 있다.

`BrowserRouter`라 배포 후 `/crayon` 직접 접속이 404가 나지 않도록 `vercel.json`이 전 경로를 `index.html`로 rewrite한다. (DECISIONS 017)

## 씬 그래프 (3D)

현재(Phase 8 진행 중):

- `Experience` (`<Canvas orthographic>`) — Orthographic 카메라(아이소메트릭 오프셋)·조명(테마 연동)·배경, 우클릭 메뉴 차단. 카메라 초기 위치는 `CHARACTER_START`에 아이소메트릭 오프셋을 더한 값이다.
  - `SceneErrorBoundary` — 씬 콘텐츠를 감싸는 안전망. 하위 렌더 중 던져진 에러(텍스처 로드 최종 실패 등)를 잡아 앱 전체가 언마운트되는 것을 막는다. 각 컴포넌트가 스스로 실패를 처리하는 게 먼저이고 이건 마지막 방어선이다.
    - `World`(자체 `Suspense`) — 모눈종이 바닥(PaperGround, 레이캐스트 대상). 우클릭 홀드 입력으로 목표점(`useCameraStore`) 갱신. 스테이션이 활성이어도 이동은 그대로 받는다.
    - `Character` — 임시 캐릭터(박스). 매 프레임 `target`으로 고정 속도 이동, 위치를 `useCameraStore.position`에 반영. 이동 잠금 중에는 목표점을 현재 위치로 스냅해 멈춘다. 스테이션 연출이 지정한 이동(`walking`)은 예외로 통과하며, 자리에 닿으면 그 신호를 꺼 기다리던 쪽에 알린다.
    - `CameraRig` — 캐릭터와의 고정 오프셋 유지하며 매 프레임 따라가 화면 중앙에 둠. 오프셋은 한 번만 잡아 `useCameraStore.followOffset`에 기록한다(스테이션이 복귀 자세를 계산할 때 쓴다). 스테이션이 활성화되면 팔로우를 멈춰 카메라 제어권을 넘기고, 닫히면 복귀시킨다. 연출 이동 중에는 아직 넘기지 않는다 — 캐릭터가 자리로 걸어가는 동안은 평소처럼 따라간다.
    - **스테이션 콘텐츠** — 텍스처를 `useLoader`로 불러오다 suspend하므로 `Suspense`로 감싼다. 비활성 모습과 활성 상세는 **경계를 따로** 둔다 — 묶으면 비활성 텍스처가 준비될 때까지 활성 구현이 커밋되지 못해 첫 화면의 카메라 자세가 늦게 잡힌다(LEARNING 2026-07-28).
      - `Stations` — 스테이션 배치 + 매 프레임 근접 판정(`nearId`) + 좌클릭 활성화(캔버스 `mousedown`을 직접 듣고 레이캐스트). 거리 재는 법은 스테이션이 등록한 `distanceTo`를 쓰고, 없으면 배치 좌표까지의 거리로 잰다.
        - `Station` — 레지스트리에 비활성 구현(`Inactive`)이 있으면 그것을 그리고, **없으면 아무것도 그리지 않는다**(종이 위에 놓을 그림이 정해지기 전이다). 클릭 판정 대상은 `userData.stationId`를 실은 오브젝트이고 그것을 두는 것도 구현이다(판정은 `Stations`가 함). **경계는 스테이션마다 하나씩** 둬, 한 스테이션의 텍스처가 다른 스테이션을 붙잡지 않게 한다.
          - `AboutSkillsInactive` — 클릭 판정 판 + 공구함 스티커(`SkillsBox`). 스티커는 차례를 알리는 신호(`useSkillsSequenceStore.logoTurn`)를 구독해 스스로 줄어들어 영역 좌상단으로 물러나 로고가 된다. 전환을 활성 구현에 두지 않는 이유는 같은 오브젝트가 이어서 변형돼야 하기 때문이다. (DECISIONS 020)
      - `ActiveStationScene` — 활성 스테이션의 3D 상세 마운트 자리(레지스트리에 등록된 `Scene`). 상세는 **다 준비된 뒤 한 번에** 보여준다 — 스테이션이 `useStationGate`로 건 열쇠가 남아 있으면 마운트한 채 감춰, 그동안 텍스처를 굽고 글자 크기를 재는 일이 끝난다.
        - `AboutSkillsScene` — 캐릭터 이동과 카메라 각도 전환. 세 연출이 **겹치지 않고 차례로** 돈다 — 캐릭터가 페이지 앞자리로 걸어간 뒤 카메라가 돌고, 그다음 공구함이 물러난다. 공구함에게 차례를 넘기는 신호와 라이프사이클 완료 신호를 낸다. 완전히 활성인 동안에는 페이지 내용을 함께 그린다.
          - `SkillsTitle` — 로고 옆 손글씨 제목. 고정이다.
          - `SkillsPages` — Firestore `skills`를 분류별 페이지로 나눠 그린다(`SkillItem` + 레벨 별 `SkillLevel`). 페이지를 넘기면 이 영역만 갈리고, 우측 하단 `SkillsPager`가 한 번에 하나(다음 또는 이전)만 낸다. (DECISIONS 021)
          - `SkillsExit` — 우상단 나가기 자리. 아이콘은 공용 `ExitSticker`다.
    - `AssetPreload` — 앱이 뜰 때 종이 스티커를 미리 구워 캐시에 넣는다(그리는 것 없음). 필요해진 순간에 굽기 시작하면 그때 서스펜드가 걸려 이미 떠 있던 것들이 사라졌다 돌아온다. 목록은 `content/assets.ts`이고, 에셋을 추가하면 거기 한 줄 넣는다.
    - `MapDecorations`(자체 `Suspense`) — 스테이션에 속하지 않는 맵 장식(길안내 화살표·조작 안내·표지판)의 마운트 자리. 영역·근접 판정·라이프사이클이 없어 마운트만 하고, 무엇을 언제 어떻게 그릴지는 요소가 각자 정한다. 특정 스테이션으로 유도하는 요소도 그 스테이션이 아니라 여기 속한다. Suspense를 요소마다 두지 않는 이유는 하나만 빠뜨려도 그 suspend가 씬 전체로 번지기 때문이다. (DECISIONS 018)
      - `useAfterIntro`(`MapDecorations.hooks`) — 장식이 공유하는 등장 조건. 라이프사이클이 처음 `idle`이 되는 시점(= Intro가 닫혀 카메라 전환이 끝난 뒤)이고, 지연 초를 주면 그만큼 더 기다린다. 첫 화면은 Intro가 활성이라 그 위에 장식을 얹으면 페이지를 가린다.
      - `SkillsGuideArrow` — 캐릭터 시작 자리에서 Skills 쪽을 가리키는 바닥 화살표. 등장하며 크레파스로 긋듯 그어진다.
      - `RightClickHint` — 화살표 곁의 우클릭 안내 아이콘(오른쪽 버튼을 칠한 마우스 그림, 종이 스티커). 화살표를 다 그은 뒤에 나타나고, `useCameraStore.hasMoved`가 켜지면(= 우클릭으로 이동하면) 사라진다.

Canvas 밖(`App`): `SceneGate` — 첫 화면 가림막. 바닥·캐릭터·Intro(글씨·사진)가 모두 준비될 때까지 덮었다가 페이드로 걷는다. 경계가 나뉘어 있어 준비되는 대로 하나씩 나타나면 순서가 뒤집혀 보이므로, 함께 보여야 하는 것만 골라 기다린다. 한 번 걷으면 다시 덮지 않고, 제 시간에 준비되지 않으면 새로고침으로 재시도하다 횟수를 넘기면 그냥 걷는다. `StationLifecycle` — 2D 상세 마운트 자리(`Overlay`) + ESC 종료 + 미구현 스테이션 fallback. `Minimap`(프로덕션에도 노출) · `CrayonStudio`(오른쪽 아래 크레파스 버튼 → 모달 그리기 도구, 프로덕션에도 노출. 단 코드 좌표 복사만 dev로 가려진다) · `DevHUD`(dev 전용 HUD 묶음 — `DebugHUD` 상태 표시 + `GridPaperHUD`·`IntroPageHUD`·`SkillsPageHUD`·`MapDecorationsHUD` leva 튜닝 패널. 패널 자체는 `GridPaperHUD`가 그리고 나머지는 폴더로 얹힌다). `DevHUD`만 App이 `import.meta.env.DEV`로 감싸 프로덕션 번들에서 빠진다. 크레파스 스튜디오는 `/crayon`에서 단독 페이지로도 뜬다.

테마 토글은 밤 테마를 제대로 구현할 때(Phase 10) 다시 단다. 컴포넌트(`ui/ThemeToggle`)와 스토어는 그대로 있다.

예정: 나머지 스테이션의 비활성 상태·활성 연출(Phase 8) · 인쇄 문서(Phase 9).

## 상태 관리 (zustand)

- `useThemeStore` — 테마 모드(light/dark) + toggle, 2D·3D 동시 전환.
- `useCameraStore` — 이동 상태: `position`(현재 위치, 좌표만 변경) · `target`(목표점, 경계 clamp) · `setTarget(point)` · `walking`/`walkTo(point)`/`endWalk()`(스테이션 연출이 지정한 이동 — 잠금 중에도 그 자리로는 걸어가고, 도착하면 `Character`가 끈다) · `viewAngle`(CameraRig가 유도, 미니맵이 사용) · `followOffset`(카메라 − 캐릭터, CameraRig가 기록) · `motion.speed`(디버그용) · `hasMoved`/`markMoved()`(우클릭 이동 입력을 받은 적 있는지 — 조작 안내를 걷는 신호. 잠금을 통과한 입력만 세고 처음 한 번만 `set`한다) · 상수 `CAMERA_BOUNDS` · `CHARACTER_START`.
- `useStationStore` — 스테이션 상호작용: `nearId`(근접) · `activeId` · `phase`(`idle`/`entering`/`active`/`exiting`) · `setNear` · `activate` · `enterComplete` · `requestClose` · `exitComplete`. 초기값은 `about-intro`가 `active`인 상태다(사이트 첫 화면). `setNear`는 활성 스테이션에서 멀어지면 그대로 종료를 건다. 이동 잠금 여부는 `isMovementLocked(phase)`로 판단(진입 애니메이션 중에만 잠김).
- 스테이션 게이트(`stations/useStationGate`) — 활성 상세가 아직 준비되지 않았음을 알리는 열쇠 모음. 공통층(`ActiveStationScene`)이 이를 보고 상세를 감췄다 보여준다.
- `useSceneReadyStore` — 첫 화면에 필요한 것들의 준비 여부(`markReady(key)`). 바닥·캐릭터·스테이션·Intro 사진이 마운트되며 자기 이름을 올리고, `SceneGate`가 이를 보고 가림막을 걷는다.
- `useIntroPageStore` — Intro 페이지의 개발용 튜닝 상태(영역·배치·테두리 표시). 프로덕션에는 HUD가 없어 항상 기본값이다.
- `useSkillsPageStore` — Skills 페이지 전체의 개발용 튜닝 상태(영역·좌상단·테두리 표시 · 공구함 배치와 테두리·그림자 · 로고 자세 · 제목 · 목록 · 레벨 별 · 페이지 넘김 · 나가기). 마찬가지로 프로덕션에서는 항상 기본값이다.
- `useSkillsSequenceStore` — Skills 활성 연출의 차례 신호(`logoTurn`). 걷는 시간이 거리에 따라 달라져 지연 상수로 차례를 맞출 수 없어, 전체 순서를 아는 활성 구현이 신호를 내고 상시 마운트된 공구함이 그것을 본다.
- `useMapDecorationsStore` — 맵 장식의 개발용 튜닝 상태(안내 화살표 배치·연출 · 우클릭 안내 배치). 장식은 스테이션 소속이 아니므로 페이지 스토어와 나눠 둔다.

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
- 우클릭은 순수하게 이동이다. 좌클릭은 idle 상태에서 근접한 스테이션을 활성화하고(`Stations`가 캔버스 `mousedown`을 레이캐스트), 활성 상태에서는 상세 내부 요소 상호작용에 쓴다.

**공용 부품** (`src/stations/`)

레지스트리에 등록하는 구현들이 함께 쓰는 것만 둔다. `ExitSticker`(나가기 아이콘 — 동작은 `requestClose()`, 놓을 자리는 스테이션이 정한다. DECISIONS 022) · `usePointerCursor`(누를 수 있는 씬 요소의 손가락 커서) · `types`(영역·troika 측정 타입).

**레지스트리** (`src/stations/registry.ts`)

`스테이션 id → { Inactive?, distanceTo?, Scene?, Overlay? }`.

- `Inactive` — 평소(비활성) 모습. 스테이션 위치에 **상시 마운트**된다. 등록하지 않으면 아무것도 그려지지 않는다.
- `distanceTo` — 근접 판정에 쓸 거리 계산. 스테이션마다 영역 모양이 다르므로 계산을 맡긴다(영역 안이면 0). 등록하지 않으면 공통층이 배치 좌표까지의 거리로 잰다.
- 상세가 서스펜드하지 않고 늦게 오는 것(Firestore 데이터 등)을 기다려야 하면 `useStationGate(key, waiting)`으로 알린다. 열쇠가 걸린 동안 공통층이 상세를 감춰 두므로, 준비되면 한 번에 뜬다.
- `Scene`·`Overlay` — 활성화되는 동안만 마운트된다. `Scene`은 Canvas 안(3D), `Overlay`는 Canvas 밖(DOM)이다. 상세가 2D면 `Overlay`로 DOM 패널을 그리거나 `Scene` 안에서 drei `<Html transform>`을 쓸 수 있고, 3D면 `Scene`에서 직접 그린다. 공통 셸이나 기본 구현체는 두지 않는다.

**계약**

- 스테이션 구현은 `phase`를 props로 받아 진입·종료 애니메이션을 재생하고, 끝나면 `enterComplete()`/`exitComplete()`로 알린다. 알리지 않으면 잠금이 풀리지 않는다.
- 활성화되는 동안 **카메라 제어권은 스테이션 구현에 있다**(`CameraRig`가 팔로우를 멈춘다). gsap 트윈이든 `useFrame`이든 자유롭게 쓰되 언마운트 시 자기 트윈을 정리해야 한다.
- 진입 연출로 **캐릭터를 자기 자리로 데려갈 수 있다**(`useCameraStore.walkTo`). 걷는 동안에는 제어권이 아직 넘어오지 않아 카메라가 평소처럼 캐릭터를 따라가고, 도착해야 스테이션이 이어받는다. 이동 잠금은 그대로 걸리되 이 이동만 예외다. (DECISIONS 007)
- **복귀는 공통층이 보장한다.** 카메라를 어디에 두고 끝내도 팔로우가 재개되며 원래 오프셋·zoom으로 돌아온다. 스테이션이 스스로 부드럽게 되돌리려면 `useCameraStore.followOffset`으로 복귀 자세(캐릭터 + 오프셋, 캐릭터를 바라봄)를 계산한다 — **현재 카메라 자세를 보고 유추하면 안 된다.** 팔로우가 아직 한 번도 돌지 않았거나(첫 화면) 이미 스테이션이 카메라를 옮겨둔 뒤라면 그 자세는 항공뷰가 아니다.
- 등록된 구현이 없는 스테이션은 알릴 주체가 없으므로 `StationLifecycle`이 진입·종료를 즉시 완료 처리한다.
- **텍스처는 `setState`로 나중에 주입하지 말고 `useLoader`(Suspense)로 준비 후 주입한다.** 상태로 주입하면 "빈 렌더 → 텍스처 렌더" 한 프레임이 생겨 깜빡인다(LEARNING 2026-07-23). 경계는 공통 마운트 자리마다 하나씩 둔다(`Station` 각각 · `ActiveStationScene`). 한 경계에 여럿을 묶으면 **가장 느린 리소스가 나머지를 붙잡아** 다 같이 늦게 나타나고, 카메라 자세처럼 로딩과 무관한 일까지 밀린다. **준비 시점이 다른 것도 같은 경계에 두지 않는다** — Intro의 글씨는 Firestore 데이터를, 사진은 텍스처를 기다리므로 사진은 자기 경계를 갖는다(묶으면 사진이 뜰 때까지 페이지 전체가 버려졌다 다시 그려진다. LEARNING 2026-07-28). `CanvasTexture`처럼 런타임에 굽는 것도 `three.Loader`를 상속한 전용 로더로 감싸 `useLoader`에 태운다(크레파스 획·종이 스티커가 같은 틀을 쓴다).
  **매 프레임 내용이 바뀌는 텍스처는 예외다** — 그려지는 연출(`<Crayon reveal>`)처럼 계속 다시 그리는 것은 캐시·Suspense가 맞지 않으므로, 텍스처 인스턴스를 하나 만들어 `needsUpdate`로 갱신하고 끝나면 갱신을 멈춘다.

## 렌더링 / 후처리 파이프라인

_작성 예정 (postprocessing, Bloom, 테마 전환)_
