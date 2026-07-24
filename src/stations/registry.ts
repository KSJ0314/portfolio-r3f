import type { ComponentType } from 'react'
import type { Vector3 } from 'three'
import type { Station } from '../content/stations'
import type { StationPhase } from '../state/useStationStore'
import { AboutIntroInactive, AboutIntroScene, aboutIntroDistanceTo } from './sections/about/AboutIntro'

/**
 * 스테이션 레지스트리 — `스테이션 id → 전용 구현`.
 *
 * 스테이션은 저마다 완전히 다른 것을 보여준다.
 * 그래서 공통층은 **아무것도 그리지 않고** 라이프사이클(근접·활성화·이동 잠금·종료)과
 * 마운트 자리만 제공하며, 비활성 상태와 활성 연출은 스테이션마다 여기에 등록한 컴포넌트가 직접 만든다.
 * 공통 셸·기본 구현체를 두지 않는 이유는, 있으면 이후 스테이션들이 그 틀에 맞춰지기 때문이다. (DECISIONS 007)
 *
 * `Inactive`는 평소(비활성) 모습이라 항상 마운트되고, `Scene`·`Overlay`는 활성화되는 동안만 마운트된다.
 *
 * **계약**
 * - `Inactive`를 등록하면 공통 임시 박스가 사라지므로, **클릭으로 활성화할 대상에 `userData.stationId`를
 *   직접 실어야 한다.** 좌클릭 판정은 `Stations`가 그 값을 보고 한다.
 * - `phase`가 `entering`이면 진입 애니메이션을 재생하고, 끝나면 `enterComplete()`를 호출해야 한다.
 *   그 전까지 캐릭터 이동은 잠겨 있다.
 * - `phase`가 `exiting`이면 종료 애니메이션을 재생하고, 끝나면 `exitComplete()`를 호출해야 한다.
 *   그 시점에 캐릭터가 우클릭했던 지점으로 출발하고 카메라 팔로우가 재개된다.
 * - 활성화되는 동안 **카메라 제어권은 이 컴포넌트에 있다**(공통층은 팔로우를 멈춘다).
 *   원하는 대로 움직이되(gsap 트윈·useFrame 등) 언마운트 시 자기 트윈을 정리할 것.
 *   카메라를 어디에 두고 끝내도 복귀는 공통층(CameraRig)이 보장한다.
 *
 * 등록된 구현이 없는 스테이션은 활성화돼도 아무것도 렌더되지 않고,
 * 공통층이 진입·종료를 즉시 완료 처리한다(StationLifecycle).
 */

export interface StationInactiveProps {
  /** 이 스테이션의 배치 데이터(위치·라벨·섹션). 마운트 자리는 이미 그 위치로 옮겨져 있다. */
  station: Station
}

export interface StationDetailProps {
  /** 활성화된 스테이션의 배치 데이터(위치·라벨·섹션). */
  station: Station
  /** 현재 라이프사이클 단계 — entering(진입 애니메이션) · active · exiting(종료 애니메이션). */
  phase: StationPhase
}

export interface StationEntry {
  /** 비활성 상태 — 평소 종이 위에 놓인 모습. Canvas 안, 스테이션 위치에 상시 마운트. */
  Inactive?: ComponentType<StationInactiveProps>
  /**
   * 캐릭터 위치에서 이 스테이션까지의 거리(근접 판정용).
   * 스테이션마다 영역 모양이 다르므로 계산을 스테이션에 맡긴다 — 영역 안이면 0을 돌려준다.
   * 등록하지 않으면 공통층이 배치 좌표(중심점)까지의 거리로 잰다.
   */
  distanceTo?: (point: Vector3, station: Station) => number
  /** 3D 상세 — Canvas 안에 마운트. 오브젝트 확장·카메라 연출 등. */
  Scene?: ComponentType<StationDetailProps>
  /** 2D 상세 — Canvas 밖(DOM)에 마운트. 텍스트·이미지 패널 등. */
  Overlay?: ComponentType<StationDetailProps>
}

/** 스테이션별 구현 등록표. 상세 구현 단계(Phase 8)에서 스테이션마다 하나씩 채운다. */
export const STATION_REGISTRY: Record<string, StationEntry> = {
  'about-intro': {
    Inactive: AboutIntroInactive,
    distanceTo: aboutIntroDistanceTo,
    Scene: AboutIntroScene,
  },
}

/** 활성 스테이션의 등록 구현을 찾는다(없으면 undefined). */
export const getStationEntry = (id: string): StationEntry | undefined => STATION_REGISTRY[id]
