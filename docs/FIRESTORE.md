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

**최소 골격.** 지금은 각 컬렉션이 존재하기만 한다(빈 `_placeholder` 문서). **필드 설계는 콘텐츠를 넣는 Phase 7에서** 정한다.

컬렉션 생성은 `scripts/seed-firestore.mjs`로 한다 — Firestore는 빈 컬렉션을 못 만들어, 문서를 하나 넣어야 컬렉션이 생긴다. config는 `.env.local`에서 읽는다(하드코딩 안 함). 실행: `node --env-file=.env.local scripts/seed-firestore.mjs`.

## 데이터 접근 (`src/lib/firebase/`)

- **읽기 훅** — 컴포넌트(스테이션)에서 사용
  - `useCollection<T>(name)` → `{ data(오브젝트 배열), loading, error }`
  - `useDoc<T>(name, id)` → `{ data(오브젝트 or null), loading, error }`
- **읽기 함수** (훅 내부·비컴포넌트용) — `fetchCollection(name)` · `fetchDoc(name, id)`
- **쓰기 함수(개발용 — 콘텐츠 5종 입력)** — `setDocData(name, id, data)` · `addDocData(name, data)`
- 방명록 쓰기는 여기 없다 — 입력 검증·App Check와 함께 **Phase 11**에서 만든다.
- Firebase web config는 번들에 노출되는 공개값 → env는 비밀이 아니라 환경 분리용. 보안은 규칙 + App Check가 담당.

## 보안 규칙

**콘솔에서 직접 관리한다**(레포에 규칙 파일을 두지 않음).

- **현재(개발 중): 열린 규칙** — 전체 read/write 허용. 콘텐츠 입력·시드를 위해.
- **배포 전(Phase 11~12): 잠금** — 콘텐츠 5종은 read 공개 / write 차단(관리자는 콘솔·스크립트로만), guestbook은 create만 허용 + 필드 검증.

## App Check / reCAPTCHA

**Phase 11(방명록)로 연기.** 주 용도가 방명록 쓰기 악용 차단이라 방명록 구현과 함께 넣는다.
