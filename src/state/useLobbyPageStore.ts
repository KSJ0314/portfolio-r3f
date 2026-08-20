import { create } from 'zustand'
import {
  LOBBY_TRIGGER_MARKER_BOB,
  LOBBY_TRIGGER_MARKER_GAP,
  LOBBY_TRIGGER_MARKER_SIZE,
} from '../stations/sections/projects/ProjectsLobby/LobbyTriggers/LobbyTriggers.constants'
import {
  LOBBY_CAMERA_FOV,
  LOBBY_CAMERA_OFFSET,
  LOBBY_CAMERA_SHIFT,
  LOBBY_TRIGGER_FOCUS,
  LOBBY_TRIGGER_FOCUS_SECONDS,
} from '../stations/sections/projects/ProjectsLobby/ProjectsLobby.constants'
import { LOBBY_BOOK_TRIGGER } from '../stations/sections/projects/ProjectsLobby/LobbyBook'

/** 책을 볼 때의 기본값. 트리거마다 다르지만 HUD로 맞추는 것은 책뿐이다. */
const BOOK_FOCUS = LOBBY_TRIGGER_FOCUS[LOBBY_BOOK_TRIGGER]

/** 실내 카메라 — 캐릭터와의 고정 오프셋과 화각. */
export interface LobbyCameraPlacement {
  /**
   * 팔로우 오프셋(카메라 − 캐릭터). x는 방위, y·z의 비가 내려다보는 각도다.
   * 원근 카메라라 **길이가 곧 크기**다 — 멀어지면 작아진다.
   */
  x: number
  y: number
  z: number
  /** 세로 화각(도). 넓힐수록 원근이 세게 느껴진다. */
  fov: number
  /**
   * 캐릭터를 화면 한가운데에서 비켜 놓는 정도(화면 반크기 대비 비율, -1~1).
   * 오프셋이 각도를 정한다면 이쪽은 **구도**를 정한다 — 캐릭터를 어디에 두고 무엇을 더 보여줄지.
   */
  shiftX: number
  shiftY: number
}

/** 트리거 — 누를 수 있다는 표시와, 열었을 때 카메라가 서는 자리. */
export interface LobbyTriggerTuning {
  /** 표시를 트리거 윗면에서 띄우는 높이. */
  markerGap: number
  /** 표시 원뿔 높이. */
  markerSize: number
  /** 위아래로 흔들리는 폭. */
  markerBob: number
  /** 책을 볼 때 카메라가 서는 자리(트리거 중심 기준). */
  bookX: number
  bookY: number
  bookZ: number
  /**
   * 책을 화면 한가운데에서 비켜 놓는 정도(화면 반크기 대비, -1~1).
   * 카메라가 책을 바라보므로 이것이 없으면 책이 늘 정중앙에 박힌다.
   */
  bookShiftX: number
  bookShiftY: number
  /** 보러 도는 데 걸리는 시간(초). 닫힐 때도 같다. */
  focusSeconds: number
}

interface LobbyPageState {
  camera: LobbyCameraPlacement
  setCamera: (camera: LobbyCameraPlacement) => void
  trigger: LobbyTriggerTuning
  setTrigger: (trigger: LobbyTriggerTuning) => void
  /** 판정에 쓰는 콜라이더를 화면에 그릴지. 눈으로 맞춰 보기 위한 것이라 기본은 꺼짐이다. */
  showColliders: boolean
  setShowColliders: (show: boolean) => void
}

/**
 * 로비의 개발용 튜닝 상태.
 * 프로덕션에서는 HUD가 렌더되지 않아 항상 기본값이다.
 * 여기서 맞춘 값을 `ProjectsLobby.constants.ts`의 기본값에 반영하면 확정된다.
 */
export const useLobbyPageStore = create<LobbyPageState>((set) => ({
  camera: {
    x: LOBBY_CAMERA_OFFSET[0],
    y: LOBBY_CAMERA_OFFSET[1],
    z: LOBBY_CAMERA_OFFSET[2],
    fov: LOBBY_CAMERA_FOV,
    shiftX: LOBBY_CAMERA_SHIFT.x,
    shiftY: LOBBY_CAMERA_SHIFT.y,
  },
  setCamera: (camera) => set({ camera }),
  trigger: {
    markerGap: LOBBY_TRIGGER_MARKER_GAP,
    markerSize: LOBBY_TRIGGER_MARKER_SIZE,
    markerBob: LOBBY_TRIGGER_MARKER_BOB,
    bookX: BOOK_FOCUS.offset[0],
    bookY: BOOK_FOCUS.offset[1],
    bookZ: BOOK_FOCUS.offset[2],
    bookShiftX: BOOK_FOCUS.shift.x,
    bookShiftY: BOOK_FOCUS.shift.y,
    focusSeconds: LOBBY_TRIGGER_FOCUS_SECONDS,
  },
  setTrigger: (trigger) => set({ trigger }),
  showColliders: false,
  setShowColliders: (showColliders) => set({ showColliders }),
}))
