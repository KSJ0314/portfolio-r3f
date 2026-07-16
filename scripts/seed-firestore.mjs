// Firestore에 빈 컬렉션 8개를 만든다(필드 없는 플레이스홀더 문서 하나씩).
// Firestore는 문서가 있어야 컬렉션이 생기므로 `_placeholder` 문서를 넣는다.
// 개발용 열린 규칙(allow write)이 켜져 있어야 동작한다. 실제 데이터는 Phase 7.
//
// 실행: node --env-file=.env.local scripts/seed-firestore.mjs
// config는 .env.local의 VITE_FIREBASE_* 값을 읽는다(하드코딩하지 않는다).
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const collections = [
  'profile',
  'skills',
  'experiences',
  'education',
  'awards',
  'spec',
  'projects',
  'guestbook',
]

for (const name of collections) {
  await setDoc(doc(db, name, '_placeholder'), {})
  console.log(`created: ${name}`)
}

console.log('done')
process.exit(0)
