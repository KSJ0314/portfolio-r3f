# portfolio-r3f — 마스터 플랜

> ThreeJS(react-three-fiber) 기반 3D 인터랙티브 포트폴리오.
> 3D 월드 탐험 → 오브젝트와 상호작용 → 2D 콘텐츠 표시 → 인쇄/PDF 출력.
> 프론트엔드 취업용 포트폴리오. (게임 "MECCHA CHAMELEON", "춘식이의 관찰일기", "동물의 숲"에서 영감 — 베끼지 않고 전환 경험을 차별점으로)

---

## 1. 컨셉

- **3D 영역** = 흥미 유발 / 브랜딩 / Three.js 실력 어필
- **2D 영역** = 실제 포트폴리오 콘텐츠 (읽기 쉬움 + 인쇄/PDF 출력)
- **시그니처 경험** = 기울어진 항공뷰에서 월드에 떠 있는 "벽(패널)"을 인터랙션하면 카메라가 그 벽 정면으로 이동해, 3D 맵은 주변에 둔 채 2D UI를 보는 2D/3D 융합

## 2. 아트 방향

- **저폴리 + 파스텔**, 아늑하고(cozy) 둥글둥글 따뜻한 분위기
- 작지만 **오픈월드 느낌의 아담한 섬/마을** ("동물의 숲" / "춘식이의 관찰일기" 톤)
- **우상단 미니맵** 프리뷰 (월드 + 카메라 위치 + 스테이션 표시)

## 3. 기술 스택

| 영역 | 선택 |
|---|---|
| 빌드/언어 | React + TypeScript + Vite |
| 3D | three · @react-three/fiber · @react-three/drei(`<Html transform>`) · @react-three/postprocessing(Bloom) |
| 상태 | zustand |
| 애니메이션 | gsap (카메라 트윈, 낮/밤 전환) |
| 스타일 | styled-components v6 + ThemeProvider |
| 데이터/백엔드 | Firebase Firestore (+App Check) |
| 출력 | react-to-print |
| 저장(페인팅) | localforage (IndexedDB) — Phase 7 |
| 개발 보조 | leva (라이트/카메라 값 튜닝) |
| 배포 | GitHub Pages + GitHub Actions (public 레포) |

## 4. 핵심 설계 결정

- **통합 테마 토글**: 라이트=낮 / 다크=밤+네온·야광. 하나의 토글이 styled-components 테마(2D)와 3D 씬(라이트·하늘·fog·Bloom)을 동시에 전환. gsap 트윈.
- **카메라**: 기울어진 항공뷰(isometric-ish) + 바닥 클릭 시 카메라 부드럽게 이동(point-to-move). 캐릭터 없이 타겟 기반 카메라(캐릭터는 Phase 7).
- **2D 패널 = 월드에 뜬 벽**: drei `<Html transform>`로 실제 styled-components DOM을 3D 벽에 투영. 인터랙션 시 카메라가 벽 정면으로 gsap 트윈, 3D 맵은 주변에 유지. 닫기 → 항공뷰 복귀.
- **단일 소스(Single Source of Truth)**: 3D 패널과 인쇄 뷰가 같은 데이터(Firestore) 사용. 프로젝트는 로컬 메타 + 캡처 이미지.

## 5. 데이터 (Firestore)

컬렉션: `profile · skills · experiences · awards · projects · guestbook`

- **콘텐츠 전부 Firestore** (향후 웹 이력서 사이트와 데이터 공유 목적).
- 트레이드오프: 로딩 상태 처리 필요, SEO 약간 불리(포트폴리오엔 허용 범위).
- **방명록**: 공개 작성 + App Check/reCAPTCHA + Firestore 보안 규칙으로 봇·악성 차단. 신고/삭제는 직접.
- Firebase web config는 번들에 노출되는 공개값 → 보안은 키 숨김이 아니라 **Firestore 보안 규칙 + App Check**로.

## 6. 프로젝트(포트폴리오 메인)

- **기본 설명은 Firestore `projects`** 에 저장 → 데이터로 전시 벽 생성.
- 맵에 **여러 프로젝트 벽을 한 줄로 전시**(PPT 모양 갤러리). 인터랙션 → 카메라가 벽 정면으로 이동.
- 각 벽에 **"체험하기" 버튼** → 그 프로젝트의 **메인 기능 인터랙티브 데모**(프로젝트마다 별도 코드 구현)를 **포커스 모드(전용 화면/오버레이)**로 실행.
- 연결: Firestore 프로젝트 문서의 `demoKey` ↔ 로컬 데모 레지스트리 매칭.

```
src/features/projects/
  ProjectGallery/             # Firestore에서 벽들 전시(한 줄)
  demos/
    registry.ts               # demoKey -> 데모 컴포넌트 매핑
    <demoKey>/
      index.ts · Demo.tsx · Demo.styled.ts · Demo.types.ts
```
Firestore `projects` 문서 예: `{ title, summary, tech[], images[], links, demoKey }`

## 7. 폴더/컴포넌트 규칙

각 컴포넌트는 전용 폴더로 분리:
```
ComponentName/
  index.ts                 # re-export (배럴)
  ComponentName.tsx        # 로직/마크업
  ComponentName.styled.ts  # styled-components
  ComponentName.types.ts   # 타입/인터페이스
  (필요 시) .hooks.ts / .constants.ts
```

예상 전체 구조:
```
src/
  main.tsx · App.tsx
  scene/        # Experience(<Canvas>) · World · CameraRig · stations/
  features/
    projects/   # ProjectGallery · demos/
    guestbook/
  ui/           # Overlay · ContentPanel · PrintView · Minimap · ThemeToggle · PaintMode(Phase7)
  state/        # zustand 스토어
  lib/          # firebase · raycast · storage(localforage)
  content/      # 로컬 콘텐츠/상수
  theme/        # light/dark 토큰 · styled.d.ts
  styles/       # GlobalStyle
```

## 8. 로드맵 (★ = MVP 핵심)

| Phase | 내용 |
|---|---|
| **0. 셋업** | Vite+R3F+TS, styled-components+ThemeProvider, 기본 씬, PLAN.md |
| **0.5. 배포 파이프라인** | public 레포 + GitHub Actions + Pages + base 경로 (초반 구축, 매 푸시 자동배포) |
| **1. 맵 + 클릭 카메라** ★ | 저폴리/파스텔, 기울어진 항공뷰, 바닥 클릭→카메라 트윈 이동 |
| **2. 스테이션 + 상호작용 + 미니맵** ★ | 스테이션 데이터 정의, 임시 Box, 클릭/근접 트리거, 우상단 미니맵 |
| **3. 2D/3D 전환** ★ | 벽 + 카메라 정면 이동 + `<Html transform>` 패널, 닫기 복귀 |
| **3.5. Firebase 데이터 레이어** ★ | SDK 초기화, 스키마, 보안 규칙, App Check, env/secrets |
| **4. 콘텐츠** ★ | Firestore(profile/skills/experiences/awards/projects) → 패널 + 프로젝트 전시 벽 |
| **4.5. 프로젝트 인터랙티브 데모** ★ | "체험하기" 버튼 → 코드 데모, 프로젝트별 점진 추가 (포트폴리오 메인) |
| **5. 출력(인쇄/PDF)** | PrintView, A4·PPT 레이아웃, 단일 소스 |
| **5.5. 방명록** | 쓰기 폼 + 봇 방지 + 규칙 (선택적 3D 표현) |
| **6. 폴리싱** | Bloom/네온, 낮/밤 전환 연출, 로딩, 반응형, 성능(Draco·instancing), 접근성, SEO |
| **7. 캐릭터 + 페인팅** (후순위·변경가능) | 휴머노이드 + 페인팅(브러시·스포이드·패턴) + localforage 저장. MECCHA CHAMELEON 영감(위장 게임 루프 제외, 아바타 커스터마이징 용도) |

- **우선순위**: 콘텐츠 & 맵 & 프로젝트 데모 우선 / 캐릭터 & 페인팅 최후순위(변경 가능).
- 초기엔 캐릭터 없이 클릭으로 카메라만 이동. 필요 시 `BoxGeometry` 임시 오브젝트.

## 9. 배포

- **GitHub Pages + GitHub Actions** (public 레포, 무료 Pages).
- Vite `base` 경로 설정(`/portfolio-r3f/` 또는 커스텀 도메인 루트).
- SPA 라우팅(`/print` 등) → Pages용 404 폴백 또는 hash 라우팅.
- Firebase 설정값은 GitHub Actions 시크릿/변수로 주입(공개값이지만 관리 일원화).
- CI/CD는 **초반(Phase 0~1)** 구축.

## 10. 진행 방식

매 Phase 시작 전 세부 작업을 검토받고 → 착수 → 결과 확인. 단계별 허락 후 진행.

---

## 결정 로그 (요약)

- 캐릭터: 백지 휴머노이드 페인팅 아바타(MECCHA CHAMELEON 영감) — **최후순위, 변경 가능**
- 이동: 클릭 이동(point-to-move), 3인칭 / 카메라: 기울어진 항공뷰
- 페인팅: 3D 표면 직접 붓질 + 풀세트(브러시·스포이드·패턴), 별도 UI, 부스+상시버튼, IndexedDB 저장
- 테마: 통합 토글(라이트=낮 / 다크=밤+네온)
- 2D 벽: drei `<Html transform>`
- 데이터: 전부 Firestore / 방명록: 공개 작성 + 봇 방지
- 프로젝트: Firestore 정보 + 전시 벽 + "체험하기" 버튼(코드 데모)
- 배포: GitHub Pages + Actions(초반), 미니맵 우상단
