# portfolio-r3f — 마스터 플랜

> ThreeJS(react-three-fiber) 기반 3D 인터랙티브 포트폴리오.
> 3D 월드 탐험 → 오브젝트와 상호작용 → 2D 콘텐츠 표시 → 인쇄/PDF 출력.
> 프론트엔드 취업용 포트폴리오. (게임 "MECCHA CHAMELEON", "춘식이의 관찰일기", "동물의 숲"에서 영감 — 베끼지 않고 전환 경험을 차별점으로)

---

## 1. 컨셉

- **3D 영역** = 흥미 유발 / 브랜딩 / Three.js 실력 어필
- **2D 영역** = 실제 포트폴리오 콘텐츠 (읽기 쉬움 + 인쇄/PDF 출력)
- **시그니처 경험** = 기울어진 항공뷰 맵에서 주제별로 갈라진 길을 다니며, 각 스테이션이 내용을 암시하는 **고유한 3D 오브젝트**로 놓여 있고, 클릭하면 그 오브젝트가 **제자리에서 활성화·확장**되어 상세(2D/3D/혼합)를 보여주는 인터랙션. 3D 맵은 주변에 유지, 갈림길엔 표지판으로 안내.

## 2. 아트 방향

- **저폴리 + 파스텔**, 아늑하고(cozy) 둥글둥글 따뜻한 분위기
- 작지만 **오픈월드 느낌의 아담한 섬/마을** ("동물의 숲" / "춘식이의 관찰일기" 톤)
- **우상단 미니맵** 프리뷰 (월드 + 카메라 위치 + 스테이션 표시)

## 3. 기술 스택

| 영역 | 선택 |
|---|---|
| 빌드/언어 | React + TypeScript + Vite |
| 3D | three · @react-three/fiber · @react-three/drei(Html · Grid · Text 등) · @react-three/postprocessing(Bloom) |
| 상태 | zustand |
| 애니메이션 | gsap (카메라 트윈, 낮/밤 전환) |
| 스타일 | styled-components v6 + ThemeProvider |
| 데이터/백엔드 | Firebase Firestore (+App Check) |
| 출력 | react-to-print |
| 저장(페인팅) | localforage (IndexedDB) — Phase 13 |
| 개발 보조 | leva (라이트/카메라 값 튜닝) |
| 배포 | GitHub Pages + GitHub Actions (public 레포) |

## 4. 핵심 설계 결정

- **통합 테마 토글**: 라이트=낮 / 다크=밤+네온·야광. 하나의 토글이 styled-components 테마(2D)와 3D 씬(라이트·하늘·fog·Bloom)을 동시에 전환. gsap 트윈.
- **카메라**: 기울어진 항공뷰(isometric-ish) + 바닥 클릭 시 카메라 부드럽게 이동(point-to-move). 캐릭터 없이 타겟 기반 카메라(캐릭터는 Phase 13).
- **스테이션 = 월드 내 고유 오브젝트**: 각 스테이션을 내용 암시하는 서로 다른 3D 오브젝트로 배치. 좌클릭 시 카메라가 그 오브젝트에 포커스하고, 오브젝트가 제자리에서 활성화·확장돼 상세를 보여준다(2D 패널 / 3D 확장 / 혼합). 3D 맵은 주변에 유지, 닫기 → 항공뷰 복귀. 겉모습·상세는 `id → 전용 컴포넌트` 레지스트리로 스테이션별 독립 구현. (drei `<Html transform>`은 상세가 2D일 때 쓰는 한 옵션.)
- **단일 소스(Single Source of Truth)**: 3D 상세 뷰와 인쇄 뷰가 같은 데이터(Firestore) 사용. 프로젝트는 로컬 메타 + 캡처 이미지.

## 5. 데이터 (Firestore)

컬렉션: `profile · skills · experiences · awards · projects · guestbook`

- **콘텐츠 전부 Firestore** (향후 웹 이력서 사이트와 데이터 공유 목적).
- 트레이드오프: 로딩 상태 처리 필요, SEO 약간 불리(포트폴리오엔 허용 범위).
- **방명록**: 공개 작성 + App Check/reCAPTCHA + Firestore 보안 규칙으로 봇·악성 차단. 신고/삭제는 직접.
- Firebase web config는 번들에 노출되는 공개값 → 보안은 키 숨김이 아니라 **Firestore 보안 규칙 + App Check**로.

## 6. 프로젝트(포트폴리오 메인)

- **기본 설명은 Firestore `projects`** 에 저장 → 데이터로 프로젝트 스테이션 생성.
- 맵의 **"Projects 길"에 프로젝트마다 스테이션 오브젝트**를 배치. 인터랙션 → 카메라가 그 오브젝트에 포커스 + 제자리 활성화 상세.
- 각 프로젝트 스테이션에 **"체험하기" 버튼** → 그 프로젝트의 **메인 기능 인터랙티브 데모**(프로젝트마다 별도 코드 구현)를 **포커스 모드(전용 화면/오버레이)**로 실행.
- 연결: Firestore 프로젝트 문서의 `demoKey` ↔ 로컬 데모 레지스트리 매칭.

```
src/features/projects/
  ProjectGallery/             # Firestore에서 프로젝트 스테이션 배치(Projects 길)
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

> 아트(디자인·모델링·배치)는 위에서 아래로 확정되어야 한다: **아트 디렉션 → 맵/환경 베이스 → 스테이션 디자인**. 그래서 기능은 임시 Box로 먼저 검증하고, 아트 전용 단계(4·5·8)를 의존성 순서로 둔다. (배경: [DECISIONS 006])

| Phase | 내용 |
|---|---|
| **0. 셋업** | Vite+R3F+TS, styled-components+ThemeProvider, 기본 씬, PLAN.md |
| **0.5. 배포 파이프라인** | Vercel 연결 (main=프로덕션 / develop=스테이징 / PR=프리뷰), Git 연동 자동 CI/CD |
| **1. 맵 + 클릭 카메라** ★ | 기울어진 항공뷰, 바닥 클릭→카메라 이동 (아트는 임시) |
| **2. 스테이션 + 상호작용 + 미니맵** ★ | 스테이션 데이터 정의, 임시 Box, 클릭/근접 트리거, 우상단 미니맵 |
| **3. 2D/3D 전환** ★ | 스테이션 오브젝트 활성화·확장 + 카메라 포커스 + 상세 표시(2D/3D), 닫기 복귀 (기능/placeholder) |
| **4. 아트 디렉션 확정** ☆ | 팔레트·저폴리/파스텔 스타일·라이트/다크(밤+네온) 룩·레퍼런스·**에셋 소싱 방식** → DESIGN.md 완성 |
| **5. 맵/환경 베이스 디자인** ☆ | 바닥·지형·길·경계벽·분위기 소품·**스테이션 최종 배치/스케일** (스테이션 디자인 선행조건) |
| **6. Firebase 데이터 레이어** ★ | SDK 초기화, 스키마, 보안 규칙, App Check, env/secrets |
| **7. 콘텐츠** ★ | Firestore(profile/skills/experiences/awards/projects) → 스테이션 상세 + 프로젝트 스테이션 |
| **8. 스테이션 디자인/모델링** ☆ | 맵 룩+콘텐츠 기반, 각 스테이션 고유 오브젝트 + 활성화 상세를 `id→전용 컴포넌트` 레지스트리로 교체, **표지판·소품** 포함 |
| **9. 프로젝트 인터랙티브 데모** ★ | "체험하기" 버튼 → 코드 데모, 프로젝트별 점진 추가 (포트폴리오 메인) |
| **10. 출력(인쇄/PDF)** | PrintView, A4·PPT 레이아웃, 단일 소스 |
| **11. 방명록** | 쓰기 폼 + 봇 방지 + 규칙 (선택적 3D 표현) |
| **12. 폴리싱** | Bloom/네온, 낮/밤 전환 연출, 로딩, 반응형, 성능(Draco·instancing), 접근성, SEO |
| **13. 캐릭터 + 페인팅** (후순위·변경가능) | 휴머노이드 + 페인팅(브러시·스포이드·패턴) + localforage 저장. MECCHA CHAMELEON 영감(위장 게임 루프 제외, 아바타 커스터마이징 용도) |

- 범례: ★ = MVP 핵심 · ☆ = 아트 전용 단계
- **우선순위**: 콘텐츠 & 맵 & 프로젝트 데모 우선 / 캐릭터 & 페인팅 최후순위(변경 가능).
- **기능→아트 순서**: 이동·상호작용·2D/3D 전환은 임시 Box로 먼저(2·3) 검증 → 아트 디렉션(4)·맵 베이스(5) 확정 → 콘텐츠(7) → 스테이션 실제 모델(8)로 교체. 동선이 바뀌어도 아트 재작업을 최소화.
- 초기엔 캐릭터 없이 클릭으로 카메라만 이동. 필요 시 `BoxGeometry` 임시 오브젝트.

## 9. 배포

- **Vercel** (Git 연동 자동 CI/CD, 별도 Actions 불필요).
- 환경: `main` → 프로덕션(라이브) / `develop` → 스테이징 프리뷰 / PR·`release/*` → 자동 프리뷰.
- Vite 자동 감지(build `npm run build`, output `dist`), 루트 도메인 + SPA 처리로 base 경로 문제 없음.
- Firebase 등 환경변수는 Vercel 프로젝트 설정에 주입.
- 브랜치 전략: Git Flow (main+develop+feature, 운영 시 release·hotfix 추가) — 상세는 CONVENTIONS.

## 10. 진행 방식

매 Phase 시작 전 세부 작업을 검토받고 → 착수 → 결과 확인. 단계별 허락 후 진행.

---

## 결정 로그 (요약)

- 캐릭터: 백지 휴머노이드 페인팅 아바타(MECCHA CHAMELEON 영감) — **최후순위, 변경 가능**
- 이동: 클릭 이동(point-to-move), 3인칭 / 카메라: 기울어진 항공뷰
- 페인팅: 3D 표면 직접 붓질 + 풀세트(브러시·스포이드·패턴), 별도 UI, 부스+상시버튼, IndexedDB 저장
- 테마: 통합 토글(라이트=낮 / 다크=밤+네온)
- 스테이션: 고유 3D 오브젝트 + 제자리 활성화(상세 2D/3D/혼합), `id → 전용 컴포넌트` 레지스트리 (Html transform은 2D 상세 옵션)
- 데이터: 전부 Firestore / 방명록: 공개 작성 + 봇 방지
- 프로젝트: Firestore 정보 + "Projects 길"에 프로젝트별 스테이션 + "체험하기" 버튼(코드 데모)
- 배포: Vercel (main=프로덕션 / develop=스테이징 / PR=프리뷰), 미니맵 우상단
- 브랜치: Git Flow (main+develop+feature, 운영 시 release·hotfix)
