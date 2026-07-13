import type { ComponentType } from 'react'
import type { Station } from '../../content/stations'
import type { StationPhase } from '../../state/useStationStore'
import { AboutIntroScene } from './impl/AboutIntro'

/**
 * 스테이션 상세 레지스트리 — `스테이션 id → 전용 구현`.
 *
 * 스테이션은 저마다 완전히 다른 것을 보여준다.
 * 그래서 공통층은 **상세를 전혀 그리지 않고** 활성화 라이프사이클(근접·활성화·이동 잠금·종료)과
 * 마운트 자리만 제공하며, 실제 상세와 카메라 연출은 스테이션마다 여기에 등록한 컴포넌트가 직접 만든다.
 * 공통 셸·기본 구현체를 두지 않는 이유는, 있으면 이후 스테이션들이 그 틀에 맞춰지기 때문이다. (DECISIONS 007)
 *
 * **계약**
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

export interface StationDetailProps {
  /** 활성화된 스테이션의 배치 데이터(위치·라벨·섹션). */
  station: Station
  /** 현재 라이프사이클 단계 — entering(진입 애니메이션) · active · exiting(종료 애니메이션). */
  phase: StationPhase
}

export interface StationEntry {
  /** 3D 상세 — Canvas 안에 마운트. 오브젝트 확장·카메라 연출 등. */
  Scene?: ComponentType<StationDetailProps>
  /** 2D 상세 — Canvas 밖(DOM)에 마운트. 텍스트·이미지 패널 등. */
  Overlay?: ComponentType<StationDetailProps>
}

/**
 * 스테이션별 구현 등록표. 상세 구현 단계에서 스테이션마다 하나씩 채운다.
 * (콘텐츠·고유 오브젝트가 준비되는 Phase 7·8 이후)
 *
 * `about-intro`은 라이프사이클 확인용 임시 뼈대다(애니메이션 자리에 지연만 있음).
 */
export const STATION_REGISTRY: Record<string, StationEntry> = {
  'about-intro': { Scene: AboutIntroScene },
}

/** 활성 스테이션의 등록 구현을 찾는다(없으면 undefined). */
export const getStationEntry = (id: string): StationEntry | undefined => STATION_REGISTRY[id]
