import { create } from 'zustand'
import { CREDIT_MODEL_LIGHT, CREDIT_STICKER_POSE } from '../ui/Credits/Credits.constants'

/** 종이 스티커를 미리보기에 세우는 자세(도). */
export interface CreditStickerPose {
  /** 눕힌 각. 0이면 화면을 정면으로 보고 서고, 90이면 바닥에 완전히 눕는다. */
  tilt: number
  /** 판 안에서 그림을 돌리는 각. 눕힌 뒤에 걸린다. */
  spin: number
}

/** 모델에 담겨 온 광원(벽등)을 미리보기에서 어떻게 켤지. */
export interface CreditModelLight {
  /** 세기 배수. glb에 담긴 값에 곱한다. */
  intensity: number
  /** 닿는 거리 — 모델의 가장 긴 변 대비 비율. */
  range: number
}

interface CreditsPreviewState {
  sticker: CreditStickerPose
  modelLight: CreditModelLight
  setSticker(next: Partial<CreditStickerPose>): void
  setModelLight(next: Partial<CreditModelLight>): void
}

/**
 * 에셋 출처 미리보기의 개발용 튜닝 상태.
 *
 * 스티커를 어떤 각도로 세워야 실물처럼 보이는지, 실내 모델의 등을 얼마나 켜야 안이 보이는지는
 * 눈으로 맞춰야 하는 값이라 HUD로 조절한다. 프로덕션에는 HUD가 없어 늘 기본값이다.
 */
export const useCreditsPreviewStore = create<CreditsPreviewState>((set) => ({
  sticker: { ...CREDIT_STICKER_POSE },
  modelLight: { ...CREDIT_MODEL_LIGHT },
  setSticker: (next) => set((s) => ({ sticker: { ...s.sticker, ...next } })),
  setModelLight: (next) => set((s) => ({ modelLight: { ...s.modelLight, ...next } })),
}))
