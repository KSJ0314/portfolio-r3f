/**
 * Draco 디코더를 three 패키지에서 public/draco/ 로 복사한다.
 *
 * drei `useGLTF`의 기본 디코더 경로는 gstatic CDN이라 "외부 CDN 요청 없음" 원칙(DESIGN)과 어긋난다.
 * 복사한 것을 앱이 `/draco/`로 가리켜 self-host한다.
 *
 * 결과물은 모눈종이 PNG와 같이 레포에 커밋한다 — 설치 스크립트에 걸어 두면 빌드 환경이
 * 그것을 건너뛸 때 디코더 없이 배포된다.
 *
 * 실행: node scripts/copy-draco.mjs (three를 올린 뒤에 다시 돌린다)
 */
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FROM = resolve(ROOT, 'node_modules/three/examples/jsm/libs/draco/gltf')
const TO = resolve(ROOT, 'public/draco')

// wasm 두 개가 실제로 쓰이는 경로이고, draco_decoder.js는 wasm이 없는 브라우저용 대체본이다.
// 대체본은 wasm이 되는 브라우저에서는 받아 가지 않으므로 함께 둔다.
const FILES = ['draco_wasm_wrapper.js', 'draco_decoder.wasm', 'draco_decoder.js']

mkdirSync(TO, { recursive: true })
for (const file of FILES) {
  copyFileSync(resolve(FROM, file), resolve(TO, file))
  console.log(`copied ${file}`)
}
console.log(`\nDraco 디코더 → ${TO}`)
