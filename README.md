# portfolio-r3f

> ThreeJS(react-three-fiber) 기반 3D 인터랙티브 포트폴리오

🔗 https://kimsojung-portfolio.vercel.app/

## 소개

3D 월드를 돌아다니며 스테이션을 찾고, 스테이션 활성화 시 카메라를 전환해 2D 처럼 포트폴리오 내용을 보여주는 사이트

## 주요 기능

- **기울어진 항공뷰** : Orthographic 아이소메트릭. 우클릭 홀드로 캐릭터가 이동하고 카메라가 따라간다.
- **스테이션 제자리 활성화** : 카메라를 탑뷰로 전환해 종이 위에 포트폴리오 내용을 2D로 보여준다.
- **Firestore 콘텐츠** : 프로필·기술·교육·수상·자격증 등의 데이터를 Firebase에 저장하여 나타낸다. 데이터를 재사용하여 추후 이력서 웹과 연결하기 위함.
- **미니맵과 월드맵** : 우상단 미니맵을 누르면 지도가 열리고, 스테이션을 선택하여 그 자리로 즉시 이동한다.
- **손그림 요소를 코드로 생성** : 모눈종이 바닥, 크레파스 획, 오려 붙인 종이 스티커 등.
- **크레파스 스튜디오** (`/crayon`) : 크레파스로 그려 JSON 값이나 PNG로 저장하는 그림판. 3D 월드의 각종 에셋을 직접 만들기 위한 툴이다. </br>
React Router로 페이지를 나눠 크레파스 그림판만 이용할 수도 있게 지원한다.
- **에셋 출처 표기** : 외부에서 다운받은 3D 에셋의 `CC BY` 라이선스를 표기하며 방문자가 상호작용(회전, 줌)하여 에셋을 확인할 수 있도록 모달 형태로 나타낸다.

## 기술 스택

| 영역 | 사용 |
|---|---|
| 빌드·언어 | Vite · React 19 · TypeScript |
| 3D | three · @react-three/fiber · @react-three/drei · @react-three/postprocessing |
| 상태 | zustand |
| 애니메이션 | gsap |
| 스타일 | styled-components |
| 라우팅 | react-router-dom |
| 데이터 | Firebase Firestore |
| 개발 보조 | leva |

## 시작하기

```bash
npm install
cp .env.example .env.local   # Firebase 설정값을 채운다
npm run dev
```

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 후 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run preview` | 빌드 결과 미리보기 |

## 폴더 구조

```text
src/
  scene/      3D 씬 — Canvas·카메라·캐릭터·바닥·스테이션 배치·맵 장식
  stations/   스테이션 프레임워크(레지스트리·라이프사이클) + sections/ 섹션별 구현
  ui/         Canvas 밖 UI — 미니맵·월드맵·크레딧·로딩 가림막·개발용 HUD
  state/      zustand 스토어
  lib/        Firebase · 모눈종이 · 크레파스 · 종이 스티커
  content/    스테이션 배치·에셋 목록·크레딧·폰트 경로
  theme/      라이트/다크 테마 토큰
  tools/      크레파스 스튜디오(저작 도구)
public/       폰트 · 이미지 · 3D 모델 · 텍스처
docs/         계획·진행·컨벤션·아키텍처 등 프로젝트 문서
```

## 배포

**Vercel** Git 연동 자동 배포.

| 브랜치 | 환경 |
|---|---|
| `main` | 프로덕션 |
| `develop` | 스테이징 프리뷰 |
| PR | 자동 프리뷰 |

## 문서

- [전체 계획](./docs/PLAN.md)
- [진행 상황](./docs/PROGRESS.md)
- [학습 기록 · 트러블슈팅](./docs/LEARNING.md)
- [의사결정 기록](./docs/DECISIONS.md)
- [컨벤션](./docs/CONVENTIONS.md)
- [아키텍처](./docs/ARCHITECTURE.md)
- [Firestore 데이터](./docs/FIRESTORE.md)
- [디자인](./docs/DESIGN.md)

## 라이선스

- **코드** — [MIT](./LICENSE). 그림·사진·3D 에셋과 이력서 내용은 제외한다
- **폰트** — Pretendard · Gamja Flower, SIL Open Font License 1.1 (`public/fonts/*/OFL.txt`)
- **3D 모델** — CC BY 3.0. 출처는 사이트의 에셋 출처 모달에 표기한다

## 만든 사람

김소중 · [GitHub](https://github.com/KSJ0314)
