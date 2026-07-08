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

### [2026-07-07] 새로고침 시 가끔 맵이 안 뜸 (카메라 오프셋 레이스)

- **증상**: 새로고침 반복 중 드물게 3D 맵이 빈 화면.
- **환경**: @react-three/fiber v9, Orthographic 카메라.
- **원인**: `CameraRig`가 오프셋을 passive `useEffect`로 초기화. 첫 `useFrame`이 먼저 돌면 offset이 (0,0,0)이라 카메라를 원점으로 옮기고, 이후 effect가 원점이 된 위치를 읽어 offset이 (0,0,0)으로 굳음 → 카메라가 원점에 박혀 렌더 안 됨. 순서가 매번 달라 "가끔" 발생.
- **해결**: 오프셋 초기화를 `useLayoutEffect`로(첫 프레임보다 먼저 실행) + `ready` 가드(초기화 전 카메라 미조작, 훅 순서 변경 회귀 방지).
- **참고**: `src/scene/CameraRig/CameraRig.tsx`
