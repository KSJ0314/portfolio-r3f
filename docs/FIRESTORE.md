# Firestore 데이터 (FIRESTORE)

> 컬렉션·데이터 접근·보안 규칙 정리. 데이터 레이어 구현은 `src/lib/firebase/`.

## 컬렉션 (8개)

`profile · skills · experiences · education · awards · spec · projects · guestbook`

스테이션이 활성화되면 그 스테이션에 매핑된 컬렉션을 읽는다(매핑은 `src/content/stations.ts`의 `collections`).

- `about-intro` → profile
- `about-skills` → skills
- `about-career` → education · awards · spec
- `projects` → projects (건물 **안**에서도 읽는다 — 로비 책 오른쪽 페이지가 `order`순으로 목록을 싣는다)
- `guestbook` → guestbook

`awards`는 원래 `about-award` 몫이었으나 Career의 칸 구성이 교육·수상내역·자격증이라 그쪽으로 옮기고
`about-award`는 없앴다([DECISIONS 013] 갱신). **`experiences`는 지금 어느 스테이션에도 매핑되지 않는다** —
Career의 칸 셋에 자리가 없어 미뤄 뒀고, 어디에 담을지는 이후에 정한다.

읽기는 매핑을 참고해 각 스테이션 구현이 필요한 것만 직접 가져온다(예: Intro는 `useDoc('profile', 'main')`).

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
| `phone` | string | 전화번호 |
| `links` | array<{label, url}> | 링크(깃허브 등, 개수 가변) |
| `location` | string | 거주 지역 |

**skills** (기술 1개 = 문서 1개)

| 필드 | 타입 | 설명 |
|---|---|---|
| `name` | string | 기술명 |
| `category` | string | 분류 |
| `order` | number | 전체 순위(작을수록 상위, 카테고리 필터 후 정렬해도 순서 유지) |
| `level` | number (1~5) | 숙련도(이름 옆 별 개수) |
| `description` | string[] | 상세 설명(줄 단위 배열) |
| `active` | boolean | 화면에 낼지. 없으면 낸다 — 문서를 추가하며 빠뜨려도 조용히 사라지지 않게 ([DECISIONS 021]) |

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

**projects** (프로젝트 1개 = 문서 1개). **문서 개수가 곧 건물 안 전시대 개수**다 — 프로젝트마다 스테이션을 두지 않으므로 문서를 더하는 것으로 프로젝트가 늘어난다. ([DECISIONS 031])

**로비 책 오른쪽 페이지**가 같은 컬렉션을 `order`순으로 읽어 `title`·`summary`를 싣는다 — 전시대에 들어가기 전 목차 노릇이다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `title` | string | 프로젝트명 |
| `summary` | string | 한줄 요약 |
| `startDate` | string ("YYYY-MM") | 시작 |
| `endDate` | string ("YYYY-MM") \| null | 종료 |
| `link` | string | 상세 정보 링크(노션) |
| `order` | number | 표시 순서 |
| `key` | number | 프로젝트를 가리키는 번호(0부터). 사진 폴더(`public/images/projects/<key>/`)와 페이지 정의 폴더(`contents/<key>/`) 이름이 이 값이다. 없으면 액자는 회색 판으로 남고 페이지는 자리표시가 나온다 ([DECISIONS 040]) |

Firebase는 다른 프로젝트와도 공유하는 DB라 최소 정보만 둔다. 상세 필드를 로컬에 두기로 한 것([DECISIONS 012])은
Phase 8에서 **데이터가 아니라 페이지 컴포넌트**로 확정됐다 — 전시 칸에 보이는 글은 컬렉션이 아니라
`contents/<key>/`에 직접 쓰고, Firestore가 맡는 것은 칸 개수·이름판 이름·로비 책 목록·`key`다. ([DECISIONS 040])

**guestbook**: 필드 설계는 Phase 8(방명록 스테이션 구현)에서 정한다.

`profile`의 `intro`는 줄바꿈을 `\n` **두 글자**로 담고 있다. 3D 텍스트에 넘길 때 실제 개행으로 바꿔야 줄이 나뉜다.

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

**잠금 완료(2026-08-27).** 콘텐츠 7종은 read 공개 / write 차단이고, `guestbook`과 그 밖의 경로는
read·write 모두 차단이다. 브라우저 SDK로는 어디에도 쓸 수 없으므로 **콘텐츠를 더할 때는 콘솔에서
문서를 직접 추가한다.** `firestore.ts`의 개발용 쓰기 함수(`setDocData`/`addDocData`)는 그대로 두었으나
이 규칙 아래에서는 통하지 않는다.

`guestbook`의 create 허용과 필드 검증은 방명록 스테이션을 만들 때 함께 연다.

## App Check / reCAPTCHA

**Phase 8(방명록)로 연기.** 주 용도가 방명록 쓰기 악용 차단이라 방명록 구현과 함께 넣는다.
