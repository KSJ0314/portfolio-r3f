import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import { useLobbyPageStore } from '../../../state/useLobbyPageStore'
import {
  LOBBY_CAMERA_FOV,
  LOBBY_CAMERA_OFFSET,
  LOBBY_CAMERA_SHIFT,
} from '../../../stations/sections/projects/ProjectsLobby/ProjectsLobby.constants'
import { DevPanel } from '../DevPanel'

const O = LOBBY_CAMERA_OFFSET
const F = LOBBY_CAMERA_FOV
const S = LOBBY_CAMERA_SHIFT
/** 트리거 기본값은 스토어가 상수에서 만들어 둔 것을 그대로 쓴다. */
const T = useLobbyPageStore.getState().trigger

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number | string) {
  return `${description}\n기본값: ${value}`
}

/**
 * 로비를 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 로비는 맵과 라우트가 달라 맵의 HUD 묶음이 마운트되지 않는다. 그래서 패널(`DevPanel`)도
 * 여기서 함께 그린다.
 *
 * 값이 정해지면 "값 복사"로 얻은 JSON을 `ProjectsLobby.constants.ts`의 기본값에 반영해 확정한다.
 */
export function LobbyPageHUD() {
  const setCamera = useLobbyPageStore((s) => s.setCamera)
  const setTrigger = useLobbyPageStore((s) => s.setTrigger)
  const setShowColliders = useLobbyPageStore((s) => s.setShowColliders)

  // 되돌리기 버튼이 패널의 값 자체를 되돌려야 하므로 함수 형태로 정의해 set을 받는다.
  const [values, set] = useControls('로비', () => ({
    '카메라': folder(
      {
        cameraX: {
          value: O[0],
          min: -20,
          max: 20,
          step: 0.1,
          label: '오프셋 x',
          hint: hint('옆으로 비켜선 정도. 0이면 열린 남쪽 면을 정면으로 본다.', O[0]),
        },
        cameraY: {
          value: O[1],
          min: -30,
          max: 30,
          step: 0.1,
          label: '오프셋 y',
          hint: hint('카메라 높이. z와의 비가 곧 내려다보는 각도다.', O[1]),
        },
        cameraZ: {
          value: O[2],
          min: 0.5,
          max: 40,
          step: 0.1,
          label: '오프셋 z',
          hint: hint('뒤로 물러난 거리. 원근 카메라라 멀어질수록 작게 보인다.', O[2]),
        },
        cameraFov: {
          value: F,
          min: 15,
          max: 90,
          step: 1,
          label: '화각',
          hint: hint('세로 화각(도). 넓힐수록 원근이 세게 느껴지고 깊이가 과장된다.', F),
        },
      },
      { collapsed: true },
    ),
    '캐릭터 자리': folder(
      {
        shiftX: {
          value: S.x,
          min: -1,
          max: 1,
          step: 0.01,
          label: '가로',
          hint: hint('0이면 화면 한가운데. 양수면 오른쪽으로 간다.', S.x),
        },
        shiftY: {
          value: S.y,
          min: -1,
          max: 1,
          step: 0.01,
          label: '세로',
          hint: hint('0이면 화면 한가운데. 음수면 아래로 내려가 앞쪽이 더 보인다.', S.y),
        },
      },
      { collapsed: true },
    ),
    '클릭 표시': folder(
      {
        markerGap: {
          value: T.markerGap,
          min: 0,
          max: 1.5,
          step: 0.01,
          label: '띄우는 높이',
          hint: hint('트리거 윗면에서 이만큼 위에 원뿔 끝이 온다.', T.markerGap),
        },
        markerSize: {
          value: T.markerSize,
          min: 0.05,
          max: 1,
          step: 0.01,
          label: '크기',
          hint: hint('원뿔 높이. 밑면 반지름은 여기서 비율로 나온다.', T.markerSize),
        },
        markerBob: {
          value: T.markerBob,
          min: 0,
          max: 0.5,
          step: 0.01,
          label: '흔들림 폭',
          hint: hint('위아래로 오르내리는 폭. 0이면 가만히 떠 있는다.', T.markerBob),
        },
      },
      { collapsed: true },
    ),
    '책 보기': folder(
      {
        bookX: {
          value: T.bookX,
          min: -5,
          max: 5,
          step: 0.05,
          label: '오프셋 x',
          hint: hint('책 기준 좌우. 0이면 정면에서 본다.', T.bookX),
        },
        bookY: {
          value: T.bookY,
          min: -2,
          max: 5,
          step: 0.05,
          label: '오프셋 y',
          hint: hint('책보다 얼마나 위에서 보는지.', T.bookY),
        },
        bookZ: {
          value: T.bookZ,
          min: 0.2,
          max: 6,
          step: 0.05,
          label: '오프셋 z',
          hint: hint('책에서 물러난 거리. 가까울수록 크게 보인다.', T.bookZ),
        },
        bookShiftX: {
          value: T.bookShiftX,
          min: -1,
          max: 1,
          step: 0.01,
          label: '구도 가로',
          hint: hint('0이면 책이 화면 한가운데. 양수면 오른쪽으로 간다.', T.bookShiftX),
        },
        bookShiftY: {
          value: T.bookShiftY,
          min: -1,
          max: 1,
          step: 0.01,
          label: '구도 세로',
          hint: hint('0이면 책이 화면 한가운데. 음수면 아래로 내려간다.', T.bookShiftY),
        },
        focusSeconds: {
          value: T.focusSeconds,
          min: 0.1,
          max: 4,
          step: 0.1,
          label: '도는 시간',
          hint: hint('책을 보러 도는 데 걸리는 시간(초). 닫힐 때도 같다.', T.focusSeconds),
        },
      },
      { collapsed: true },
    ),
    '판정': folder(
      {
        showColliders: {
          value: false,
          label: '콜라이더 보기',
          hint: '판정에 쓰는 콜라이더를 그대로 그린다.\n초록 바닥 · 빨강 막는 것 · 파랑 머리 위 · 노랑 트리거 · 회색 안 쓰임',
        },
      },
      { collapsed: true },
    ),
  }))

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    '로비',
    {
      '값 복사(JSON)': button(() => {
        const { camera, trigger } = useLobbyPageStore.getState()
        const json = JSON.stringify(
          {
            offset: [camera.x, camera.y, camera.z],
            fov: camera.fov,
            shift: { x: camera.shiftX, y: camera.shiftY },
            marker: {
              gap: trigger.markerGap,
              size: trigger.markerSize,
              bob: trigger.markerBob,
            },
            bookFocus: {
              offset: [trigger.bookX, trigger.bookY, trigger.bookZ],
              shift: { x: trigger.bookShiftX, y: trigger.bookShiftY },
            },
            focusSeconds: trigger.focusSeconds,
          },
          null,
          2,
        )
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() =>
        set({
          cameraX: O[0],
          cameraY: O[1],
          cameraZ: O[2],
          cameraFov: F,
          shiftX: S.x,
          shiftY: S.y,
          markerGap: T.markerGap,
          markerSize: T.markerSize,
          markerBob: T.markerBob,
          bookX: T.bookX,
          bookY: T.bookY,
          bookZ: T.bookZ,
          bookShiftX: T.bookShiftX,
          bookShiftY: T.bookShiftY,
          focusSeconds: T.focusSeconds,
        }),
      ),
    },
    [set],
  )

  useEffect(() => {
    setCamera({
      x: values.cameraX,
      y: values.cameraY,
      z: values.cameraZ,
      fov: values.cameraFov,
      shiftX: values.shiftX,
      shiftY: values.shiftY,
    })
  }, [values, setCamera])

  useEffect(() => {
    setTrigger({
      markerGap: values.markerGap,
      markerSize: values.markerSize,
      markerBob: values.markerBob,
      bookX: values.bookX,
      bookY: values.bookY,
      bookZ: values.bookZ,
      bookShiftX: values.bookShiftX,
      bookShiftY: values.bookShiftY,
      focusSeconds: values.focusSeconds,
    })
  }, [values, setTrigger])

  useEffect(() => {
    setShowColliders(values.showColliders)
  }, [values.showColliders, setShowColliders])

  return <DevPanel />
}
