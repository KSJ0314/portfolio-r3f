# Firestore 데이터 (FIRESTORE)

> 컬렉션·데이터 접근·보안 규칙 정리. 데이터 레이어 구현은 `src/lib/firebase/`.

## 컬렉션 (8개)

`profile · skills · experiences · education · awards · spec · projects · guestbook`

스테이션이 활성화되면 그 스테이션에 매핑된 컬렉션을 읽는다(매핑은 `src/content/stations.ts`의 `collections`).

- `about-intro` → profile · skills
- `about-career` → experiences · education · spec
- `about-award` → awards
- `project-*` → projects
- `guestbook` → guestbook

## 스키마

컬렉션·데이터는 `src/lib/firebase/firestore.ts`의 개발용 쓰기 함수(`setDocData`/`addDocData`)로 채웠다(Phase 6~7, 일회성 스크립트로 실행 후 정리). 아래는 그 결과로 확정된 필드다.

**profile** (단일 문서, id `main`)

| 필드 | 타입 | 설명 |
|---|---|---|
| `name` | string | 이름 |
| `role` | string | 직무/포지션 |
| `tagline` | string | 한 줄 소개 |
| `intro` | string | 자기소개 본문(줄바꿈 포함) |
| `email` | string | 이메일 |
| `links` | array<{label, url}> | 링크(깃허브 등, 개수 가변) |
| `location` | string | 거주 지역 |

**skills** (기술 1개 = 문서 1개)

| 필드 | 타입 | 설명 |
|---|---|---|
| `name` | string | 기술명 |
| `category` | string | 분류 |
| `order` | number | 전체 순위(작을수록 상위, 카테고리 필터 후 정렬해도 순서 유지) |
| `level` | number (1~5) | 숙련도 |
| `description` | string[] | 상세 설명(줄 단위 배열) |

**experiences** (경력 1건 = 문서 1개, `order` 없음 — `startDate` 기준 최신순 정렬)

| 필드 | 타입 | 설명 |
|---|---|---|
| `company` | string | 근무처 |
| `location` | string | 근무지역 |
| `department` | string | 부서명 |
| `role` | string | 직무 |
| `employmentType` | string | 고용형태 |
| `startDate` | string ("YYYY-MM") | 시작 |
| `endDate` | string ("YYYY-MM") \| null | 종료(재직 중이면 null) |
| `description` | string[] | 업무 내용 |

**education** (과정 1건 = 문서 1개, `order` 없음 — `startDate` 기준 정렬)

| 필드 | 타입 | 설명 |
|---|---|---|
| `institution` | string | 기관명 |
| `program` | string | 과정명 |
| `startDate` | string ("YYYY-MM") | 시작 |
| `endDate` | string ("YYYY-MM") \| null | 종료 |

**awards** (수상 1건 = 문서 1개, `order` 없음 — `date` 기준 정렬)

| 필드 | 타입 | 설명 |
|---|---|---|
| `title` | string | 수상명 |
| `organization` | string | 수여 기관 |
| `description` | string[] | 수상 내용 |
| `date` | string ("YYYY-MM") | 수상 시기 |

**spec** (자격증 1건 = 문서 1개, `order` 없음 — `date` 기준 정렬)

| 필드 | 타입 | 설명 |
|---|---|---|
| `name` | string | 자격증명 |
| `organization` | string | 발급 기관 |
| `date` | string ("YYYY-MM") | 취득일 |

**projects** (프로젝트 1개 = 문서 1개)

| 필드 | 타입 | 설명 |
|---|---|---|
| `title` | string | 프로젝트명 |
| `summary` | string | 한줄 요약 |
| `startDate` | string ("YYYY-MM") | 시작 |
| `endDate` | string ("YYYY-MM") \| null | 종료 |
| `link` | string | 상세 정보 링크(노션) |
| `order` | number | 표시 순서 |

Firebase는 다른 프로젝트와도 공유하는 DB라 최소 정보만 둔다. `tech`·`images`·`demoKey` 등 상세 필드는 로컬에 별도 저장하며, 스테이션 상세 구현(Phase 8) 시 확정한다. ([DECISIONS 012])

**guestbook**: 필드 설계는 Phase 8(방명록 구현)에서 정한다.

## 데이터 접근 (`src/lib/firebase/`)

- **읽기 훅** — 컴포넌트(스테이션)에서 사용
  - `useCollection<T>(name)` → `{ data(오브젝트 배열), loading, error }`
  - `useDoc<T>(name, id)` → `{ data(오브젝트 or null), loading, error }`
- **읽기 함수** (훅 내부·비컴포넌트용) — `fetchCollection(name)` · `fetchDoc(name, id)`
- **쓰기 함수(개발용 — 콘텐츠 7종 입력, 방명록 제외)** — `setDocData(name, id, data)` · `addDocData(name, data)`
- 방명록 쓰기는 여기 없다 — 입력 검증·App Check와 함께 **Phase 8**에서 만든다.
- Firebase web config는 번들에 노출되는 공개값 → env는 비밀이 아니라 환경 분리용. 보안은 규칙 + App Check가 담당.

## 보안 규칙

**콘솔에서 직접 관리한다**(레포에 규칙 파일을 두지 않음).

- **현재(개발 중): 열린 규칙** — 전체 read/write 허용. 콘텐츠 입력·시드를 위해.
- **배포 전(Phase 8~9): 잠금** — 콘텐츠 7종은 read 공개 / write 차단(관리자는 콘솔·스크립트로만), guestbook은 create만 허용 + 필드 검증.

## App Check / reCAPTCHA

**Phase 8(방명록)로 연기.** 주 용도가 방명록 쓰기 악용 차단이라 방명록 구현과 함께 넣는다.
