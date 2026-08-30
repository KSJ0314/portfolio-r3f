import { jsPDF } from 'jspdf'
import { createLogger } from '../../lib/logger'
import { BAKE_HEIGHT, BAKE_WIDTH, PDF_FILE_NAME } from './ListView.constants'
import type { ListShot } from './ListView.types'

const log = createLogger('list:pdf')

/** blob 주소의 그림을 PDF에 넣을 수 있는 형태로 읽는다. */
async function readImage(url: string): Promise<string> {
  const blob = await fetch(url).then((response) => response.blob())
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/** 묶는 동안 밖에서 알려 주는 것들. */
interface BuildOptions {
  onProgress?: (ratio: number) => void
  /**
   * 그만둘지. 장마다 확인해 참이면 곧바로 멈춘다.
   * 화면을 떠나면 그림의 blob 주소가 되돌려지므로, 끝까지 돌게 두면 없는 주소를 읽으려다 실패한다.
   */
  cancelled?: () => boolean
}

/**
 * 구운 그림들을 PDF 한 개로 묶는다.
 *
 * 페이지 크기를 굽는 크기 그대로 두어 그림이 여백 없이 꽉 찬다 — 화면과 인쇄물이 같아진다.
 * 다시 굽지 않고 이미 구운 그림을 그대로 넣는다.
 *
 * 진행률은 **넣은 장수**로 알린다. 마지막에 파일로 묶는 구간은 jspdf가 알려주지 않아 쪼갤 수 없다.
 * 도중에 그만두면 null을 준다.
 */
export async function buildShotsPdf(
  shots: readonly ListShot[],
  { onProgress, cancelled }: BuildOptions = {},
): Promise<Blob | null> {
  if (shots.length === 0) return null

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [BAKE_WIDTH, BAKE_HEIGHT],
    compress: true,
  })

  for (const [index, shot] of shots.entries()) {
    if (cancelled?.()) return null
    if (index > 0) doc.addPage([BAKE_WIDTH, BAKE_HEIGHT], 'landscape')
    doc.addImage(await readImage(shot.url), 'JPEG', 0, 0, BAKE_WIDTH, BAKE_HEIGHT)
    onProgress?.((index + 1) / shots.length)
  }

  if (cancelled?.()) return null
  log('%d쪽 묶음', shots.length)
  return doc.output('blob')
}

/** 만들어 둔 PDF를 파일로 준다. */
export function saveShotsPdf(pdf: Blob): void {
  const url = URL.createObjectURL(pdf)
  const link = document.createElement('a')
  link.href = url
  link.download = `${PDF_FILE_NAME}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
