# 학습 기록 (LEARNING)

> 프로젝트를 진행하며 새로 배운 개념·기법을 기록합니다. 문제·해결 기록(트러블슈팅)도 이 문서 안에 둡니다.

## 배운 것

> 새로 익힌 개념·기법·도구. 최신 항목을 위에 추가하세요.

### 작성 템플릿

```
### [YYYY-MM-DD] 주제

- **내용**: 무엇을 배웠는가
- **맥락**: 어떤 작업 중에 알게 됐는가
- **참고**: 링크·문서
```

### 2026-07-23

- **R3F 텍스처는 `setState`로 나중에 주입하지 말고 `useLoader`(Suspense)로 준비 후 주입한다** — 텍스처를 로드한 뒤 상태에 담아 밀어넣으면 컴포넌트가 두 번 렌더된다(1차: `texture=null`이라 텍스처 없이 그려짐 → 2차: 텍스처 붙음). 이 1~2차 사이 한 프레임이 깜빡임이다. `useLoader`/`useTexture`는 텍스처가 준비될 때까지 컴포넌트를 **Suspense로 아예 안 그려서** 그 틈이 없다. `useLoader`가 특별한 게 아니라 "텍스처를 나중에 상태로 주입하지 마라"가 핵심이다.
- **`CanvasTexture`처럼 런타임에 굽는 것도 로더로 감싸 `useLoader`에 태울 수 있다** — 파일이 아니어도 `three.Loader`를 상속해 `load`에서 캔버스를 굽고 `onLoad(texture)`로 넘기면 된다. 입력 문자열이 곧 캐시 키다(굽는 파라미터를 JSON으로 직렬화). 손그림 요소가 이 틀을 공유한다.
- **`gl.initTexture`는 "GPU 업로드 지연"만 막지, "두 번 렌더"는 못 막는다** — 텍스처를 GPU에 미리 올려주는 API지만, 깜빡임의 원인이 업로드 지연이 아니라 `setState` 두 번 렌더면 이걸 해도 소용없다. `useTexture`(drei)도 내부에서 `initTexture`를 부르지만, 안 깜빡이는 진짜 이유는 그게 아니라 Suspense 방식이다.
- **`useLoader` 방식의 대가와 예외** — Suspense를 반드시 짝으로 씌워야 하고(`<Suspense fallback={null}>`), 로드 실패가 throw로 나가므로 ErrorBoundary가 받아줘야 한다. 입력이 캐시 키라 자주 바뀌면 매번 새로 굽고 자동 dispose되지 않아 GPU에 쌓인다. 그래서 **매 프레임 바뀌는 텍스처(비디오·실시간 캔버스)는 이 방식이 아니라**, 텍스처 인스턴스를 하나 만들어두고 내용만 `needsUpdate = true`로 갱신한다.
- **Suspense 경계는 개별 구현이 아니라 공통 마운트 자리에 둔다** — 컴포넌트마다 자기 `Suspense`를 넣게 맡기면 하나만 빠뜨려도 그 suspend가 위로 전파돼 상위(씬 전체)가 fallback으로 사라진다. 여러 구현이 꽂히는 공통 자리(예: 스테이션 마운트 자리)를 하나의 `Suspense`로 감싸면, 각 구현이 최상위에서 suspend해도 그 범위가 거기까지로 묶이고 개별 구현이 안 넣어도 안전하다.

### 2026-07-22

- **R3F는 카메라의 위치만 넣고 방향은 돌리지 않는다** — `<Canvas camera={{ position }}>`는 위치·배율만 적용한다. 대상을 바라보게 만드는 것은 매 프레임 `lookAt`을 부르는 쪽(여기서는 `CameraRig`)의 일이다. 그래서 이펙트 시점의 `camera.quaternion`은 아직 아무것도 바라보지 않은 초기 회전일 수 있다. **카메라의 현재 자세를 "정상 상태"로 믿고 캡처하면 안 된다.**
- **StrictMode는 마운트 시 이펙트를 한 번 더 실행한다** — 이펙트가 바깥 상태(여기서는 카메라)를 바꾸면서 동시에 그 상태를 읽으면, 두 번째 실행이 **자기가 바꿔놓은 값**을 읽는다. 이런 이펙트는 1회 가드를 두거나, 아예 읽지 않고 계산으로 유도해야 한다.
- **수직으로 내려다볼 때의 up 벡터** — 시선이 up(+y)과 겹치면 회전이 정해지지 않는다(`lookAt`이 무너진다). 이럴 땐 up을 시선과 평행하지 않은 방향으로 직접 준다. `Matrix4.lookAt(eye, target, up)` + `Quaternion.setFromRotationMatrix`는 three의 `Camera.lookAt`이 내부에서 하는 것과 같아서, 카메라를 직접 건드리지 않고 목표 회전만 계산할 수 있다.
- **troika 텍스트의 실제 크기 재기** — 자동 줄바꿈이 걸리면 몇 줄이 될지 미리 알 수 없다. drei `<Text>`의 `onSync`가 배치를 끝낸 뒤 `textRenderInfo.blockBounds`(`[minX, minY, maxX, maxY]`)를 주므로, 글 덩어리에 맞춰 다른 요소(인용 막대 등)를 그릴 수 있다.
- **상용 한글 2350자 뽑기** — KS X 1001 완성형 2350자는 코드포인트가 연속되지 않아 범위로 지정할 수 없다. `AC00~D7A3`을 훑으며 **euc-kr로 인코딩되는 음절만** 남기면 정확히 그 집합이 된다.
- **텍스처 색공간은 하위 프로퍼티로 넘긴다** — 훅이 돌려준 텍스처에 `texture.colorSpace = ...`로 직접 대입하면 eslint(`react-hooks/immutability`)가 막는다. R3F는 `map-colorSpace={SRGBColorSpace}`처럼 하위 프로퍼티를 선언적으로 지정할 수 있어 대입 없이 해결된다.
- **손그림 재질감은 선이 아니라 알갱이** — 크레파스·연필 느낌은 경로를 매끈하게 긋는 것으로는 안 나온다. 굵기 안쪽에 알갱이를 흩뿌리되 가장자리로 갈수록 확률을 낮추면 테두리가 너덜해지고, 진하기를 저주파로 흔들면 필압이 생긴다. 다시 그릴 때마다 모양이 바뀌지 않도록 난수에는 씨앗을 준다.
- **둥근 획 마무리** — 끝점에서 자르면 단면이 보인다. 끝점 바깥으로 반지름만큼 더 나가되 폭을 `√(1 − e²)`로 줄이면 반원으로 맺힌다.

### 2026-07-14

- **three의 물리 기반 광량과 1/π** — r155부터 조명이 물리 단위라 diffuse 반사에 `1/π`가 걸린다. `intensity: 1`은 직관과 달리 어두운 빛이고, 흰색 표면이 화면에서도 희게 나오려면 `ambient + directional×dotNL`의 합이 π를 넘어야 한다. 그 아래면 흰색을 줘도 회색으로 찍힌다.
- **톤 매핑(ACES)은 흰색을 누른다** — R3F `Canvas`의 기본 톤 매핑은 사실적 렌더링용이라 밝은 색의 채도·밝기를 떨어뜨린다. 종이처럼 납작한 스타일 아트에서는 해당 오브젝트만 `toneMapped: false`로 빼거나 렌더러 설정을 끈다.
- **이방성 필터링(anisotropy)** — 바닥이 비스듬히 눕는 아이소메트릭 뷰에서는 밉맵이 텍스처를 뭉개 미세한 결·선이 통째로 사라진다. `texture.anisotropy = gl.capabilities.getMaxAnisotropy()`로 살린다.
- **심리스 타일 텍스처 만들기** — 타일을 반복해도 이음매가 없으려면, 무늬를 만드는 함수가 **타일 폭을 주기로** 가져야 한다. 사인파는 타일 폭을 정수 번 반복하면 끝에서 시작값으로 돌아오고, 값 노이즈는 격자 인덱스를 타일 폭으로 나눈 나머지로 감아 반대편과 같은 난수를 참조하게 만든다.
- **한글 웹폰트는 유니코드 범위별로 쪼갠다** — 한글은 글자 수가 많아 폰트 파일이 크다. Google Fonts는 CSS에서 `unicode-range`로 90~180개 조각으로 나눠 서빙하고, 브라우저는 화면에 실제로 뜬 글자에 해당하는 조각만 받는다. self-host할 때도 이 CSS 구조를 그대로 가져오면 된다.
- **3D 텍스트는 웹폰트를 쓰지 못한다** — drei `<Text>`(troika)는 폰트 파일을 직접 파싱해 글리프를 뽑으므로 woff2가 아니라 ttf가 필요하다. 한글 ttf는 12MB 넘게 나오므로 `fontTools.subset`으로 상용 2350자만 남겨 1MB로 줄였다.
- **DOM 오버레이(drei `Html`)는 카메라가 움직이면 밀린다** — 3D 좌표를 화면 좌표로 바꿔 CSS로 옮기는 방식이라 WebGL 렌더보다 한 프레임 늦게 반영된다. 씬 안의 글씨는 `<Text>`(WebGL 메시)로 그리면 같은 프레임에 렌더돼 밀림이 없다.

### 2026-07-13

- **Pointer Events vs Mouse Events (버튼 조합)** — `pointerdown`은 포인터가 "비활성 → 활성"이 될 때만 발생한다. 이미 어떤 버튼이 눌려 활성 상태면, 추가로 누른 버튼은 `pointerdown`을 만들지 않고 `buttons` 값만 바뀐 `pointermove`로 알려준다. 반면 `mousedown`은 버튼마다 매번 발생한다. 버튼 조합(우클릭 홀드 + 좌클릭)을 다루려면 mouse 이벤트를 쓰거나 `pointermove`의 `buttons` 변화를 감지해야 한다.
- **R3F의 이벤트는 전부 pointer 이벤트 기반** — `onClick`·`onPointerDown` 등이 pointer 이벤트 위에 올라가 있어, 위 제약을 그대로 물려받는다. 게다가 `onClick`은 누른 순간과 뗀 순간의 hit 대상이 같아야 성립하므로, 카메라가 움직이는 중에는 클릭이 성립하지 않을 수 있다.
- **eslint `react-hooks/immutability`** — 훅이 돌려준 값(`useThree().camera` 등)의 프로퍼티에 직접 대입하면(`cam.zoom = 120`) 에러가 난다. 메서드 호출(`cam.position.copy(...)`)은 통과한다. `useFrame((state) => ...)`이 넘겨주는 `state.camera`를 쓰면 훅 반환값이 아니므로 해결된다.
- **상태 머신으로 인터랙션 모델링** — boolean 플래그(`locked`) 하나로는 "애니메이션 중에만 잠금"처럼 단계가 있는 흐름을 표현할 수 없다. `idle → entering → active → exiting` 같은 phase로 두면 각 단계의 허용 입력과 잠금 여부가 명확해지고, 파생값(`isMovementLocked(phase)`)으로 중복 상태를 없앨 수 있다.

### 2026-07-09

- **Vite HMR와 R3F `useFrame`** — Fast Refresh는 react-dom `useEffect`(정리·재실행)를 갱신하지만, R3F `useFrame` 콜백은 편집을 반복하면 낡은 채로 멈출 수 있다. 동작이 이상하면 개발 서버 재시작/하드리프레시로 확인.
- **매 프레임 값은 구독 대신 `getState`** — zustand에서 프레임마다 바뀌는 값(위치 등)은 셀렉터 구독(리렌더) 대신 `store.getState()`로 읽고, 상태 반영은 값이 바뀔 때만 `set`. 매 프레임 리렌더 폭주 방지.
- **미니맵 회전각을 카메라에서 유도** — 카메라가 대상을 바라보는 방향을 지면(xz)에 투영하면 화면상 "위"에 해당. 그 방향이 미니맵 위(-y)로 가도록 회전각을 계산하면 하드코딩 없이 뷰와 일치. 회전 변환은 거리를 보존.
- **Windows 케이싱과 TypeScript** — 대소문자 무시 파일시스템이어도 TS는 폴더/파일 케이싱을 구분한다. import 케이싱과 실제 디스크 케이싱이 다르면 같은 파일을 둘로 인식(TS1261).

### 2026-07-07

- **`useLayoutEffect` vs `useFrame` 실행 순서** — layout effect는 커밋 직후 동기 실행돼 첫 rAF 프레임보다 먼저. `useFrame`보다 위에 선언하면 초기화가 항상 먼저. passive `useEffect`는 늦어 프레임과 레이스.
- **`useRef` vs `useState`** — 리렌더 불필요 + 프레임 루프에서 즉시 읽는 명령형 플래그는 ref. state는 불필요 리렌더 + 콜백 클로저 캡처로 값 갱신 타이밍 문제.
- **Orthographic 카메라** — fov 없이 `zoom`으로 배율. 원근 왜곡 없는 아이소메트릭.
- **캐릭터 팔로우 카메라** — 카메라-타겟 오프셋 고정 + 매 프레임 `lookAt`로 대상을 화면 중앙 유지.
- **매 프레임 레이캐스트 홀드 이동** — 커서 NDC에서 바닥 평면으로 `intersectPlane` → 월드 지점. 커서 정지 중에도 월드가 밀리면 지점이 바뀌어 계속 이동.

### 2026-07-01

- **`Record<K, V>`** — 키 K, 값 V 객체 타입. `Record<ThemeMode, AppTheme>`는 `light`·`dark` 키를 모두 `AppTheme` 값으로 강제하고, `themes[mode]` 접근을 타입 안전하게 만든다.
- **`.d.ts` (선언 파일)** — 런타임 코드 없이 타입 정보만 담는 파일. 빌드해도 JS로 출력되지 않는다. 타입 선언·보강 전용.
- **`declare module` / 모듈 보강(module augmentation)** — 외부 모듈의 타입에 내 타입을 덧붙여 확장. styled-components의 빈 `DefaultTheme` interface를 `AppTheme`으로 확장하면 전역 styled에서 `theme.colors...`가 자동완성·타입체크된다. (interface 선언 병합 이용)
- **`createGlobalStyle` vs 루트 CSS** — GlobalStyle은 TS 안에서 전역 CSS를 정의하고 `<GlobalStyle/>`로 렌더. 테마 값 직접 주입(`theme.colors...`)·동적 스타일 가능. 순수 CSS는 JS 테마 접근 불가(CSS 변수로 우회), 대신 가볍다.
- **`interface` vs `type`** — interface는 선언 병합 가능(모듈 보강 필수)·객체 shape 위주. type은 union·튜플·매핑 등 표현력이 크고 병합 불가. 예: `type ThemeMode = 'light' | 'dark'`, `interface AppTheme`.
- **GitHub Pages의 단일 사이트 한계** — 레포당 Pages 사이트가 1개라 스테이징/프로덕션 분리·PR 프리뷰가 기본 기능으로 불가. 다중 환경이 필요하면 Vercel/Netlify류가 적합.
- **Vercel 프리뷰 배포** — Git 연동 시 브랜치·PR마다 자동 프리뷰 URL 생성(main=프로덕션, 그 외=프리뷰). 별도 CI 워크플로 없이 배포·프리뷰 자동화.
- **Git Flow의 develop·release 역할** — develop=feature 통합("다음 릴리스"), release=배포 전 최종 검증·버전 태깅. main은 릴리스된(프로덕션) 상태만 유지.

---

## 트러블슈팅

> 개발 중 마주친 문제와 해결 과정. 최신 항목을 위에 추가하세요.

### 작성 템플릿

```
### [YYYY-MM-DD] 한 줄 제목

- **증상**: 어떤 현상이 발생했는가
- **환경**: OS / Node / 브라우저 / 관련 라이브러리 버전
- **원인**: 분석한 근본 원인
- **해결**: 적용한 조치 (코드/설정 변경)
- **참고**: 관련 링크·이슈·커밋
```

### [2026-07-23] 사진·화살표만 깜빡이고 커밋 버전 사진은 멀쩡함

- **증상**: 첫 화면에서 사진과 화살표가 두 번 깜빡인 뒤 제대로 나타남. 배경 모눈종이·글자는 멀쩡. dev·프리뷰(프로덕션) 공통. 그런데 **첫 커밋 버전의 사진은 안 깜빡였고**, 내가 재시도를 넣으며 바꾼 뒤부터 사진이 깜빡였다.
- **환경**: React 19, @react-three/fiber v9, drei.
- **원인**: 텍스처를 `useState`로 나중에 주입한 것. 커밋 버전 사진은 `useTexture`(Suspense)라 텍스처가 준비된 뒤 한 번에 그려져 멀쩡했는데, 재시도를 넣으려고 로드 후 `setState`로 주입하는 방식으로 바꾸면서 "null 렌더 → 텍스처 렌더" 두 프레임이 생겼다. 화살표는 처음부터 `CanvasTexture`를 `useMemo`/`setState`로 주입해서 커밋 때부터 같은 이유로 깜빡였다.
- **해결**: 둘 다 `useLoader`(Suspense) 방식으로. 사진은 `TextureLoader`를 상속한 재시도 로더를, 화살표는 캔버스를 굽는 전용 로더(`CrayonArrowLoader`)를 만들어 `useLoader`에 태웠다. 텍스처가 준비된 뒤 렌더 트리에 직접 주입되어 두 번 렌더가 사라졌다. 호출부는 `<Suspense fallback={null}>`로 감싸고, 최종 실패는 `SceneErrorBoundary`가 받는다.
- **삽질 기록**: StrictMode 이중 실행, leva의 값 정규화, 반투명 재질 정렬, `gl.initTexture`(GPU 업로드 지연)를 차례로 의심해 전부 헛짚었다. "커밋 사진은 멀쩡한데 지금 사진만 깜빡인다"는 차이 하나가 처음부터 답(내 변경 = `useTexture`→`setState`)을 가리키고 있었다. dev 전용 요인(StrictMode·leva)과 프로덕션 공통 증상을 섞어 본 것이 오판의 시작이었다.
- **참고**: `src/stations/sections/about/AboutIntro/`

### [2026-07-22] 스테이션을 닫으면 카메라가 각도만 돌고 위치는 마지막에 순간이동

- **증상**: 첫 화면(Intro 활성)에서 나가기 화살표를 누르면, 카메라가 캐릭터 쪽으로 돌아오지 않고 **각도만 어색하게 틀어진 뒤** 종료가 끝나는 순간 캐릭터 위치로 튐. 새로고침해도 동일.
- **환경**: React 19 StrictMode, @react-three/fiber v9, Orthographic 카메라.
- **원인**: 돌아갈 항공뷰 자세를 마운트 시점의 `camera.position`·`camera.quaternion`에서 캡처했다. 그런데 **R3F는 카메라의 위치만 넣고 방향은 돌리지 않고**, 캐릭터를 바라보게 만드는 것은 `CameraRig`가 매 프레임 하는 일이다. 첫 화면은 Intro가 활성이라 팔로우가 **한 번도 돌지 않아서**, 캡처한 회전은 아무것도 바라본 적 없는 초기값이었다. (그 전에는 StrictMode의 이펙트 재실행이 이미 정면뷰로 옮겨둔 자세를 항공뷰로 덮어쓰는 문제도 겹쳐 있었다.)
- **해결**: 자세를 캡처하지 않고 **팔로우 규칙으로 계산**한다. `CameraRig`가 초기화할 때 오프셋(카메라 − 캐릭터)을 `useCameraStore.followOffset`에 기록하고, 스테이션은 `캐릭터 위치 + 오프셋`에서 `캐릭터를 바라보는` 자세를 매번 구한다. 현재 카메라가 어디에 있든 무관해져 재마운트·HMR에도 안전하다. 걸어나가는 중에도 종료 애니메이션이 도므로 매 프레임 다시 계산한다.
- **참고**: `src/stations/sections/about/AboutIntro/`, `src/scene/CameraRig/CameraRig.tsx`

### [2026-07-22] 프로필 사진을 교체해도 화면에 반영되지 않음

- **증상**: `public/images/profile.png`를 새 파일로 바꿨는데 이전 사진이 계속 보임.
- **환경**: Vite dev, drei `useTexture`.
- **원인**: 경로가 같아 브라우저·텍스처 캐시가 이전 이미지를 그대로 쓴다. 게다가 사진 비율을 상수로 박아둬서, 새 사진의 비율이 다르면 눌려 보이는 문제도 함께 있었다.
- **해결**: 하드 새로고침으로 캐시를 비운다. 비율 상수는 아예 없애고 **불러온 텍스처의 실제 픽셀 크기에서 계산**하도록 바꿔, 사진을 갈아끼워도 코드를 고칠 일이 없게 했다.

### [2026-07-14] 흰 종이 바닥이 화면에서 회색(#D4CFC8)으로 찍힘

- **증상**: 바닥 색을 순백(`#ffffff`)으로 줘도 화면에서는 회색으로 나옴. 색상 추출 도구로 찍으면 `#D4CFC8`.
- **환경**: three 0.185 / @react-three/fiber 9 / MeshStandardMaterial
- **원인**: 바닥이 조명을 받는 재질이라 화면 밝기가 `종이색 × 광량`이 된다. three는 물리 기반 광량이라 diffuse 반사에 1/π가 걸리는데, 당시 조명값(ambient 0.9 + directional 1.3)이 만드는 광량은 `(0.9 + 1.3×0.75)/π ≈ 0.6`이라 1에 한참 못 미쳤다. 측정값 `#D4CFC8`(선형 0.65)과 계산이 일치한다.
- **해결**: 바닥만 조명을 받지 않는 재질(`MeshBasicMaterial` + `toneMapped: false`)로 교체. 조명을 올려 해결하면 씬의 모든 오브젝트가 함께 밝아지므로 답이 아니다. 낮/밤은 종이색에 색을 곱해 표현. (DECISIONS 010)
- **삽질 기록**: 회색의 원인을 톤 매핑으로 오판해 톤 매핑을 끄고 조명을 오히려 낮췄다가 더 어두워졌다. 톤 매핑도 흰색을 누르는 것은 맞지만 주된 원인은 광량이었다.

### [2026-07-14] 스테이션 이름 라벨이 카메라 이동 중에 박스에서 미끄러짐

- **증상**: 캐릭터가 움직이면 라벨이 스테이션 박스와 따로 놀다가, 멈추면 제자리로 붙음.
- **환경**: @react-three/drei `<Html>`
- **원인**: `<Html>`은 3D가 아니라 캔버스 위에 얹은 DOM이다. 매 프레임 3D 좌표를 화면 좌표로 변환해 CSS로 옮기는데, 이 DOM 갱신이 WebGL 렌더보다 한 프레임 늦게 반영된다.
- **해결**: 씬 안 글씨는 drei `<Text>`(WebGL 메시)로 그린다. 같은 프레임에 렌더되므로 밀리지 않는다. 단 troika는 폰트 파일을 직접 읽으므로 woff2가 아니라 ttf가 필요하다.

### [2026-07-13] 우클릭 홀드로 이동 중에 스테이션 좌클릭이 안 먹음

- **증상**: 가만히 서 있을 때는 스테이션 좌클릭이 되는데, 우클릭을 누른 채 이동하면서 스테이션 박스를 좌클릭하면 아무 반응이 없음. `onClick` → `onPointerDown`으로 바꿔도, R3F 이벤트 대신 캔버스에 `pointerdown` 리스너를 직접 달아도 동일.
- **환경**: Windows, Chrome, @react-three/fiber v9.
- **원인**: `pointerdown`은 포인터가 비활성에서 활성으로 바뀔 때만 발생한다. 우클릭으로 이미 활성 상태이므로 추가로 누른 좌클릭은 `pointerdown`을 발생시키지 않고, `buttons` 값만 바뀐 `pointermove`로만 온다. R3F의 포인터 이벤트가 전부 이 위에 올라가 있어 `onClick`·`onPointerDown` 모두 잡히지 않았다. (진단: `window`에 capture 단계로 `pointerdown`·`mousedown` 로그를 심어 비교 → `mousedown`만 `{ button: 0, buttons: 3 }`으로 찍힘.)
- **해결**: `Stations`가 캔버스의 `mousedown`을 직접 듣고, 커서 위치를 NDC로 변환해 스테이션 그룹에 레이캐스트한 뒤 `userData.stationId`로 활성화. `mousedown`은 버튼마다 매번 발생하므로 버튼 조합에서도 잡힌다.
- **참고**: `src/scene/Stations/Stations.tsx`

### [2026-07-09] 근접 판정이 전혀 동작 안 함 (R3F useFrame HMR 낡음)

- **증상**: 캐릭터가 스테이션에 가까이 가도 근접(near) 상태가 안 잡힘. 코드 로직은 정상.
- **환경**: Windows, Vite dev(HMR), @react-three/fiber v9.
- **원인**: 개발 중 해당 파일을 반복 수정하면서 R3F `useFrame` 콜백이 HMR로 갱신되지 않고 낡은 채 멈춤. (react-dom `useEffect`/rAF는 Fast Refresh가 정리·재실행해 정상 동작하는 것과 대비됨.)
- **해결**: 개발 서버 완전 재시작(또는 하드리프레시)로 정상화 — 코드 변경 아님. 진단 과정에서 임시로 react-dom rAF로 우회해 원인을 격리한 뒤 정통 `useFrame`으로 원복.
- **참고**: `src/scene/Stations/Stations.tsx`

### [2026-07-09] import 빨간줄·빌드 실패 (TS1261 케이싱 충돌)

- **증상**: 에디터 import 빨간줄 + `tsc -b` 실패: TS1261 "differs from file name ... only in casing".
- **환경**: Windows(대소문자 무시 파일시스템), TypeScript project references(`tsc -b`).
- **원인**: 폴더가 소문자 `src/scene/stations`(Phase 0 빈 폴더 `.gitkeep` 잔재)인데 import는 `Stations`(PascalCase). `include` 글롭은 실제 디스크 케이싱으로, import는 다른 케이싱으로 잡혀 같은 파일을 둘로 인식.
- **해결**: 폴더를 컨벤션(PascalCase) `Stations`로 통일(임시명 경유 rename), 불필요한 `.gitkeep` 제거. `tsc --noEmit`으론 안 잡히고 `tsc -b`에서 드러남.
- **참고**: `src/scene/Stations/`

### [2026-07-07] 새로고침 시 가끔 맵이 안 뜸 (카메라 오프셋 레이스)

- **증상**: 새로고침 반복 중 드물게 3D 맵이 빈 화면.
- **환경**: @react-three/fiber v9, Orthographic 카메라.
- **원인**: `CameraRig`가 오프셋을 passive `useEffect`로 초기화. 첫 `useFrame`이 먼저 돌면 offset이 (0,0,0)이라 카메라를 원점으로 옮기고, 이후 effect가 원점이 된 위치를 읽어 offset이 (0,0,0)으로 굳음 → 카메라가 원점에 박혀 렌더 안 됨. 순서가 매번 달라 "가끔" 발생.
- **해결**: 오프셋 초기화를 `useLayoutEffect`로(첫 프레임보다 먼저 실행) + `ready` 가드(초기화 전 카메라 미조작, 훅 순서 변경 회귀 방지).
- **참고**: `src/scene/CameraRig/CameraRig.tsx`
