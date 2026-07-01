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

### 2026-07-01

- **`Record<K, V>`** — 키 K, 값 V 객체 타입. `Record<ThemeMode, AppTheme>`는 `light`·`dark` 키를 모두 `AppTheme` 값으로 강제하고, `themes[mode]` 접근을 타입 안전하게 만든다.
- **`.d.ts` (선언 파일)** — 런타임 코드 없이 타입 정보만 담는 파일. 빌드해도 JS로 출력되지 않는다. 타입 선언·보강 전용.
- **`declare module` / 모듈 보강(module augmentation)** — 외부 모듈의 타입에 내 타입을 덧붙여 확장. styled-components의 빈 `DefaultTheme` interface를 `AppTheme`으로 확장하면 전역 styled에서 `theme.colors...`가 자동완성·타입체크된다. (interface 선언 병합 이용)
- **`createGlobalStyle` vs 루트 CSS** — GlobalStyle은 TS 안에서 전역 CSS를 정의하고 `<GlobalStyle/>`로 렌더. 테마 값 직접 주입(`theme.colors...`)·동적 스타일 가능. 순수 CSS는 JS 테마 접근 불가(CSS 변수로 우회), 대신 가볍다.
- **`interface` vs `type`** — interface는 선언 병합 가능(모듈 보강 필수)·객체 shape 위주. type은 union·튜플·매핑 등 표현력이 크고 병합 불가. 예: `type ThemeMode = 'light' | 'dark'`, `interface AppTheme`.

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

_아직 기록된 이슈 없음._
