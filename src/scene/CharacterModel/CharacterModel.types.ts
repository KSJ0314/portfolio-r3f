import type { Ref } from 'react'
import type { CharacterMotion } from './CharacterModel.constants'

/** 밖에서 모델을 움직이는 통로. 옮기는 쪽이 이번 프레임 걸음을 알린다. */
export interface CharacterModelHandle {
  /** 이번 프레임 걸음 속도(유닛/초). 걷기 동작을 재생할지와 그 배속이 이 값에서 정해진다. */
  applyMotion(speed: number): void
}

export interface CharacterModelProps {
  /** 걸음을 알릴 통로. 옮기는 쪽이 자기 프레임 끝에서 부른다. */
  ref?: Ref<CharacterModelHandle>
  /** 어떤 걸음으로 다닐지. */
  motion: CharacterMotion
  /** 배속 1이 되는 걸음 속도(유닛/초). 평소 걸음이 방마다 달라 기준도 방이 정한다. */
  baseSpeed: number
  /** 모델 세로의 월드 크기. 가로·깊이는 모델 비율에서 나온다. */
  height: number
  /** 걸음 속도 대비 걷기 동작의 배속. */
  walkRate: number
  /** 텍스처 색에 곱하는 밝기. */
  brightness: number
  /**
   * 톤 매핑을 태울지.
   * 종이 위(맵)에서는 뺀다 — 바닥과 같이 그린 색이 그대로 나와야 한다(DECISIONS 010).
   * 노출로 밝기를 잡는 실내에서는 태운다. 빼면 방만 어두워지고 캐릭터만 밝게 뜬다.
   */
  toneMapped: boolean
}
