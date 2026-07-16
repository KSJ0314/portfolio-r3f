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

const app = initializeApp(firebaseConfig)

/** Firestore 인스턴스. 앱 전역에서 이것을 통해 데이터에 접근한다. */
export const db = getFirestore(app)
