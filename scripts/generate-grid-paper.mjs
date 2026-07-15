/**
 * 모눈종이 텍스처(PNG)를 구워 public/textures/paper/ 에 저장한다.
 *
 * 그리는 로직·기본값은 앱과 공유한다(src/lib/gridPaper).
 * 개발용 HUD에서 값을 맞춘 뒤 그 값을 gridPaper.constants.ts에 반영하고 이 스크립트를 다시 돌리면,
 * HUD에서 보던 것과 같은 텍스처가 파일로 구워진다.
 *
 * 실행: node scripts/generate-grid-paper.mjs
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// Node는 확장자 없는 import를 해석하지 못하므로 배럴(index.ts)이 아니라 파일을 직접 가리킨다.
// Node 24는 .ts를 그대로 실행한다(타입만 지우고 돌린다).
import {
  DEFAULT_GRID_PAPER_PARAMS,
  GRID_PAPER_OUTPUT,
} from '../src/lib/gridPaper/gridPaper.constants.ts'
import { renderGridPaper } from '../src/lib/gridPaper/gridPaper.ts'

const OUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../public/textures/paper/grid-paper.png',
)

/** PNG 인코딩 — 청크(IHDR/IDAT/IEND)를 직접 조립한다. 외부 의존성 없이 쓰기 위함이다. */
function encodePng(pixels, size) {
  const raw = Buffer.alloc(size * (size * 3 + 1))
  let offset = 0
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0 // 필터 없음
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 3
      for (let i = 0; i < 3; i++) raw[offset++] = pixels[index + i]
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // 비트 깊이
  ihdr[9] = 2 // 트루컬러(RGB)

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const pixels = renderGridPaper(DEFAULT_GRID_PAPER_PARAMS, GRID_PAPER_OUTPUT)

mkdirSync(dirname(OUT_PATH), { recursive: true })
writeFileSync(OUT_PATH, encodePng(pixels, GRID_PAPER_OUTPUT.size))
console.log(
  `생성 완료: ${OUT_PATH} (${GRID_PAPER_OUTPUT.size}x${GRID_PAPER_OUTPUT.size}, ${DEFAULT_GRID_PAPER_PARAMS.cells}칸)`,
)
