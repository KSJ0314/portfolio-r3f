import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Firestore 컬렉션 이름(경로). 각 컬렉션의 데이터 모양(필드)은 콘텐츠를 넣는 Phase 7에서 정한다.
 * 여기선 이름만 계약으로 고정한다.
 */
export const COLLECTIONS = {
  profile: 'profile',
  skills: 'skills',
  experiences: 'experiences',
  education: 'education',
  awards: 'awards',
  spec: 'spec',
  projects: 'projects',
  guestbook: 'guestbook',
} as const

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS]

/** 모든 문서에 공통으로 붙는 필드. 컬렉션별 실제 필드는 Phase 7에서 이 타입을 확장한다. */
export interface DocBase {
  /** 문서 id(문서 키). data()에는 없으므로 읽을 때 실어준다. */
  id: string
}

// ── 읽기 (앱은 이를 감싼 훅(useCollection·useDoc)으로 데이터를 가져온다) ──────────

/** 컬렉션 전체를 읽어 문서 배열로 반환한다(각 문서에 id를 실어준다). */
export async function fetchCollection<T extends DocBase = DocBase>(
  name: CollectionName,
): Promise<T[]> {
  const snap = await getDocs(collection(db, name))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) }) as T)
}

/** 컬렉션에서 문서 하나를 읽는다(없으면 null). */
export async function fetchDoc<T extends DocBase = DocBase>(
  name: CollectionName,
  id: string,
): Promise<T | null> {
  const snap = await getDoc(doc(db, name, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as DocumentData) } as T
}

// ── 쓰기 (개발용 — 콘텐츠 컬렉션 입력에 쓴다. 앱 UI에서 쓰지 않는다) ──────────────
// 콘텐츠(방명록 제외 7종: profile·skills·experiences·education·awards·spec·projects)는
// 관리자가 개발 중에 넣는 데이터다.
// 방명록 쓰기는 여기 없다 — 입력 검증·App Check와 함께 Phase 11에서 만든다.

/** 지정 id로 문서를 만들거나 덮어쓴다. profile(단일 문서 `main`)처럼 id가 정해진 경우. */
export async function setDocData(
  name: CollectionName,
  id: string,
  data: DocumentData,
): Promise<void> {
  await setDoc(doc(db, name, id), data)
}

/** auto-id로 문서를 새로 만든다. 새 문서 id를 반환한다. skills·experiences 등 목록형에 쓴다. */
export async function addDocData(name: CollectionName, data: DocumentData): Promise<string> {
  const ref = await addDoc(collection(db, name), data)
  return ref.id
}
