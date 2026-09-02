import { create } from 'zustand'
import { CHARACTER_PLACEMENT } from '../scene/Character/Character.constants'
import { INTERIOR_CHARACTER } from '../stations/sections/projects/interior/Interior.constants'

/** 캐릭터의 크기·회전·걷기 동작. */
export interface CharacterPlacement {
  /** 모델 세로의 월드 크기. 가로·깊이는 모델 비율에서 나온다. */
  height: number
  /** 모델 정면을 +z로 맞추는 각(도). */
  facing: number
  /** 진행 방향으로 도는 데 걸리는 시간(초). */
  turnSeconds: number
  /** 걸음 속도 대비 걷기 동작의 배속. */
  walkRate: number
  /** 텍스처 색에 곱하는 밝기. */
  brightness: number
}

/** 실내(로비·전시 공간)에서만 달라지는 값. 방 밝기와 축척이 맵과 다르다. */
export interface InteriorCharacterPlacement {
  /** 모델 세로의 월드 크기. */
  height: number
  /** 텍스처 색에 곱하는 밝기. */
  brightness: number
}

interface CharacterState {
  placement: CharacterPlacement
  interior: InteriorCharacterPlacement
  setPlacement(next: Partial<CharacterPlacement>): void
  setInterior(next: Partial<InteriorCharacterPlacement>): void
}

/**
 * 캐릭터의 개발용 튜닝 상태.
 *
 * 정면·도는 시간·동작 배속은 모델의 성질이라 맵과 실내가 함께 보고, 크기·밝기는 방마다 다르다.
 * 몸집이 맵에서 어느 정도로 보여야 하는지, 발이 미끄러지지 않는 걸음 배속과 색이 죽지 않는
 * 밝기가 얼마인지는 눈으로 맞춰야 하는 값이라 HUD로 조절한다.
 * 프로덕션에는 HUD가 없어 늘 기본값이다.
 */
export const useCharacterStore = create<CharacterState>((set) => ({
  placement: { ...CHARACTER_PLACEMENT },
  interior: { ...INTERIOR_CHARACTER },
  setPlacement: (next) => set((s) => ({ placement: { ...s.placement, ...next } })),
  setInterior: (next) => set((s) => ({ interior: { ...s.interior, ...next } })),
}))
