import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import { useGalleryPageStore } from '../../../state/useGalleryPageStore'
import { GALLERY_PAGER } from '../../../stations/sections/projects/ProjectsGallery/GalleryPages/GalleryPager'
import {
  GALLERY_CAMERA_ANCHOR,
  GALLERY_CAMERA_FOV,
  GALLERY_CAMERA_OFFSET,
  GALLERY_CAMERA_SHIFT,
} from '../../../stations/sections/projects/ProjectsGallery/ProjectsGallery.constants'
import { DevPanel } from '../DevPanel'

const A = GALLERY_CAMERA_ANCHOR
const O = GALLERY_CAMERA_OFFSET
const F = GALLERY_CAMERA_FOV
const S = GALLERY_CAMERA_SHIFT
const P = GALLERY_PAGER

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number | string) {
  return `${description}\n기본값: ${value}`
}

/**
 * 전시 공간을 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 로비와 라우트가 달라 그쪽 HUD가 마운트되지 않는다. 그래서 패널(`DevPanel`)도 여기서 함께 그린다.
 *
 * 값이 정해지면 "값 복사"로 얻은 JSON을 `ProjectsGallery.constants.ts`의 기본값에 반영해 확정한다.
 */
export function GalleryPageHUD() {
  const setCamera = useGalleryPageStore((s) => s.setCamera)
  const setPager = useGalleryPageStore((s) => s.setPager)
  const setShowColliders = useGalleryPageStore((s) => s.setShowColliders)

  // 되돌리기 버튼이 패널의 값 자체를 되돌려야 하므로 함수 형태로 정의해 set을 받는다.
  const [values, set] = useControls('전시 공간', () => ({
    '카메라': folder(
      {
        anchorY: {
          value: A.y,
          min: 0,
          max: 8,
          step: 0.1,
          label: '보는 높이',
          hint: hint('바라보는 점의 높이. 벽에 걸린 작품 쪽에 못 박는다.', A.y),
        },
        anchorZ: {
          value: A.z,
          min: -2,
          max: 4,
          step: 0.1,
          label: '보는 깊이',
          hint: hint('바라보는 점의 깊이. 벽(0)과 열린 면(3) 사이 어디를 볼지.', A.z),
        },
        cameraX: {
          value: O[0],
          min: -20,
          max: 20,
          step: 0.1,
          label: '오프셋 x',
          hint: hint('옆으로 비켜선 정도. 0이면 벽을 정면으로 본다.', O[0]),
        },
        cameraY: {
          value: O[1],
          min: -10,
          max: 20,
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
          hint: hint('세로 화각(도). 넓힐수록 한 화면에 담기는 칸이 늘어난다.', F),
        },
      },
      { collapsed: true },
    ),
    '구도': folder(
      {
        shiftX: {
          value: S.x,
          min: -1,
          max: 1,
          step: 0.01,
          label: '가로',
          hint: hint('0이면 보는 점이 화면 한가운데. 양수면 오른쪽으로 간다.', S.x),
        },
        shiftY: {
          value: S.y,
          min: -1,
          max: 1,
          step: 0.01,
          label: '세로',
          hint: hint('0이면 보는 점이 화면 한가운데. 음수면 아래로 내려간다.', S.y),
        },
      },
      { collapsed: true },
    ),
    '페이지 넘김': folder(
      {
        dotRadius: {
          value: P.dotRadius,
          min: 0.001,
          max: 0.02,
          step: 0.0005,
          label: '점 크기',
          hint: hint('점 반지름. 액자 가로 1을 기준으로 한 비율이다.', P.dotRadius),
        },
        dotGap: {
          value: P.dotGap,
          min: 0.004,
          max: 0.06,
          step: 0.001,
          label: '점 간격',
          hint: hint(
            '점 중심에서 다음 점 중심까지. 누르는 판은 이 간격의 절반을 넘지 않는다.',
            P.dotGap,
          ),
        },
        dotBottom: {
          value: P.dotBottom,
          min: 0,
          max: 0.1,
          step: 0.002,
          label: '점 아래 여백',
          hint: hint('점을 페이지 아래 끝에서 올리는 거리.', P.dotBottom),
        },
        arrowSize: {
          value: P.arrowSize,
          min: 0.005,
          max: 0.08,
          step: 0.002,
          label: '꺾쇠 크기',
          hint: hint('꺾쇠 전체 세로.', P.arrowSize),
        },
        arrowInset: {
          value: P.arrowInset,
          min: 0,
          max: 0.1,
          step: 0.002,
          label: '꺾쇠 좌우 여백',
          hint: hint('꺾쇠를 페이지 좌우 끝에서 들이는 거리.', P.arrowInset),
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
    '전시 공간',
    {
      '값 복사(JSON)': button(() => {
        const { camera } = useGalleryPageStore.getState()
        const json = JSON.stringify(
          {
            anchor: { y: camera.anchorY, z: camera.anchorZ },
            offset: [camera.x, camera.y, camera.z],
            fov: camera.fov,
            shift: { x: camera.shiftX, y: camera.shiftY },
            pager: useGalleryPageStore.getState().pager,
          },
          null,
          2,
        )
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() =>
        set({
          anchorY: A.y,
          anchorZ: A.z,
          cameraX: O[0],
          cameraY: O[1],
          cameraZ: O[2],
          cameraFov: F,
          shiftX: S.x,
          shiftY: S.y,
          dotRadius: P.dotRadius,
          dotGap: P.dotGap,
          dotBottom: P.dotBottom,
          arrowSize: P.arrowSize,
          arrowInset: P.arrowInset,
        }),
      ),
    },
    [set],
  )

  useEffect(() => {
    setCamera({
      anchorY: values.anchorY,
      anchorZ: values.anchorZ,
      x: values.cameraX,
      y: values.cameraY,
      z: values.cameraZ,
      fov: values.cameraFov,
      shiftX: values.shiftX,
      shiftY: values.shiftY,
    })
  }, [values, setCamera])

  useEffect(() => {
    setPager({
      dotRadius: values.dotRadius,
      dotGap: values.dotGap,
      dotBottom: values.dotBottom,
      arrowSize: values.arrowSize,
      arrowInset: values.arrowInset,
    })
  }, [values, setPager])

  useEffect(() => {
    setShowColliders(values.showColliders)
  }, [values.showColliders, setShowColliders])

  return <DevPanel />
}
