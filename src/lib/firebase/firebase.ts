import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

/**
 * Firebase 웹 설정. 값은 환경변수(.env.local / Vercel)에서 주입한다.
 * web config는 번들에 노출되는 공개값 — 보안은 키 숨김이 아니라 Firestore 보안 규칙이 담당한다.
 * 봇·악용 차단용 App Check는 방명록 쓰기를 막을 때 필요하므로 Phase 8에서 추가한다.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// 값이 비면 SDK가 네트워크로 나가기도 전에 막혀, 화면만 비고 아무 단서가 남지 않는다.
// (Vite는 빌드 시점에 값을 박으므로 배포 환경에 변수를 안 넣으면 그대로 빈 채로 굳는다.)
// 그래서 어느 값이 비었는지 여기서 먼저 알린다.
const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missing.length > 0) {
  console.error(
    `[firebase] 설정값이 비어 있어 Firestore를 쓸 수 없다: ${missing.join(', ')}\n` +
      '로컬은 .env.local, 배포는 Vercel 환경변수(Production·Preview 모두)를 확인할 것. ' +
      '환경변수는 빌드 시점에 박히므로 값을 넣은 뒤 다시 배포해야 반영된다.',
  )
}

const app = initializeApp(firebaseConfig)

/** Firestore 인스턴스. 앱 전역에서 이것을 통해 데이터에 접근한다. */
export const db = getFirestore(app)
