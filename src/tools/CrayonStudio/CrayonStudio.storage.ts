import { DEFAULT_STUDIO_PARAMS } from './CrayonStudio.constants'
import type { CrayonStudioParams } from './CrayonStudio.types'

/**
 * 사이드바에서 맞춘 값을 브라우저에 남긴다. 새로 고치거나 다시 들어와도 쓰던 크레파스가 그대로 있게.
 *
 * 저장된 값은 언제든 낡거나 손상돼 있을 수 있다(예전 버전이 남긴 값, 사람이 고친 값).
 * 그대로 믿고 넣으면 슬라이더가 범위 밖으로 나가거나 색이 깨지므로, 필드마다 검사해서
 * 이상하면 그 필드만 기본값으로 되돌린다.
 */

const STORAGE_KEY = 'crayon-studio.params'

/** 슬라이더와 같은 허용 범위. 저장된 값이 여기를 벗어나면 기본값으로 되돌린다. */
const RANGES: Record<keyof Omit<CrayonStudioParams, 'color'>, [number, number]> = {
  widthRatio: [0.005, 0.25],
  wobbleRatio: [0, 1],
  opacity: [0.1, 1],
  roughness: [0, 1],
  patchiness: [0, 1],
}

function pickNumber(value: unknown, fallback: number, [min, max]: [number, number]): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return value >= min && value <= max ? value : fallback
}

function pickColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
}

export function loadStudioParams(): CrayonStudioParams {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STUDIO_PARAMS

    const saved = JSON.parse(raw) as Partial<Record<keyof CrayonStudioParams, unknown>>
    const base = DEFAULT_STUDIO_PARAMS
    return {
      color: pickColor(saved.color, base.color),
      widthRatio: pickNumber(saved.widthRatio, base.widthRatio, RANGES.widthRatio),
      wobbleRatio: pickNumber(saved.wobbleRatio, base.wobbleRatio, RANGES.wobbleRatio),
      opacity: pickNumber(saved.opacity, base.opacity, RANGES.opacity),
      roughness: pickNumber(saved.roughness, base.roughness, RANGES.roughness),
      patchiness: pickNumber(saved.patchiness, base.patchiness, RANGES.patchiness),
    }
  } catch {
    // 시크릿 모드나 저장 차단 환경에서는 읽기 자체가 막힌다. 기본값으로 그냥 쓴다.
    return DEFAULT_STUDIO_PARAMS
  }
}

export function saveStudioParams(params: CrayonStudioParams): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params))
  } catch {
    // 저장에 실패해도 그리는 데는 지장이 없다.
  }
}
