import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import { useProjectsPageStore } from '../../../state/useProjectsPageStore'
import { PROJECTS_DOOR_GLOW } from '../../../stations/sections/projects/ProjectsBuilding/DoorGlow/DoorGlow.constants'
import {
  PROJECTS_BUILDING_PLACEMENT,
  PROJECTS_ENTER,
  PROJECTS_DOOR_PLATE,
  PROJECTS_MARKER,
  PROJECTS_NEAR,
  PROJECTS_SWING,
  PROJECTS_VIEW,
} from '../../../stations/sections/projects/ProjectsBuilding/ProjectsBuilding.constants'

const B = PROJECTS_BUILDING_PLACEMENT
const N = PROJECTS_NEAR
const P = PROJECTS_DOOR_PLATE
const M = PROJECTS_MARKER
const V = PROJECTS_VIEW
const S = PROJECTS_SWING
const G = PROJECTS_DOOR_GLOW
const E = PROJECTS_ENTER

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number | string) {
  return `${description}\n기본값: ${value}`
}

/**
 * 프로젝트 섹션을 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 패널 자체(`<Leva>`)는 GridPaperHUD가 그리고, 여기서는 값만 등록해 같은 패널에 얹는다.
 * 값이 정해지면 "값 복사"로 얻은 JSON을 각 컴포넌트의 `.constants.ts` 기본값에 반영해 확정한다.
 *
 * 문·근접 구역·표시 좌표는 전부 **건물 중심 기준 상대값**이라 건물을 옮기면 함께 따라온다.
 */
export function ProjectsPageHUD() {
  const setBuilding = useProjectsPageStore((s) => s.setBuilding)
  const setNear = useProjectsPageStore((s) => s.setNear)
  const setPlate = useProjectsPageStore((s) => s.setPlate)
  const setMarker = useProjectsPageStore((s) => s.setMarker)
  const setSwing = useProjectsPageStore((s) => s.setSwing)
  const setGlow = useProjectsPageStore((s) => s.setGlow)
  const setView = useProjectsPageStore((s) => s.setView)
  const setEnter = useProjectsPageStore((s) => s.setEnter)
  const setShowOutline = useProjectsPageStore((s) => s.setShowOutline)

  const [values, set] = useControls(
    'Projects 영역',
    () => ({
      '건물': folder({
        buildingHeight: {
          value: B.height,
          min: 0.5,
          max: 15,
          step: 0.1,
          label: '세로크기',
          hint: hint('건물 높이의 월드 크기. 가로·깊이는 모델 비율에서 나온다.', B.height),
        },
        buildingPosition: {
          value: { x: B.x, z: B.z },
          step: 0.05,
          joystick: false,
          label: '좌표',
          hint: `밑면 중심(월드 x, z).\n기본값: (${B.x}, ${B.z})`,
        },
        buildingRotation: {
          value: B.rotation,
          min: -180,
          max: 180,
          step: 1,
          label: '회전',
          hint: hint('y축 회전(도). 180이면 앞면이 +z를 본다.', B.rotation),
        },
      }, { collapsed: true }),
      '문': folder({
        platePosition: {
          value: { x: P.x, z: P.z },
          step: 0.01,
          joystick: false,
          label: '클릭판 좌표',
          hint: `건물 중심에서 떨어진 거리(모델 좌표). 건물 배율이 곱해진다.
기본값: (${P.x}, ${P.z})`,
        },
        plateY: {
          value: P.y,
          min: 0,
          max: 1,
          step: 0.005,
          label: '클릭판 높이',
          hint: hint('판 중심 높이(모델 좌표).', P.y),
        },
        plateSize: {
          value: { x: P.width, y: P.height },
          step: 0.05,
          joystick: false,
          label: '클릭판 크기',
          hint: `잰 문 크기 대비 배수(가로·세로).\n기본값: (${P.width}, ${P.height})`,
        },
        swingHingeRight: {
          value: S.hingeRight,
          label: '경첩 오른쪽',
          hint: hint('끄면 왼쪽 모서리에 달린다. 바꾸면 문을 다시 뜯는다.', String(S.hingeRight)),
        },
        swingAngle: {
          value: S.angle,
          min: -180,
          max: 180,
          step: 1,
          label: '열리는 각도',
          hint: hint('열렸을 때의 각도(도). 부호가 여는 방향이다(안쪽/바깥쪽).', S.angle),
        },
        swingSeconds: {
          value: S.seconds,
          min: 0.1,
          max: 4,
          step: 0.05,
          label: '열리는 시간',
          hint: hint('열리고 닫히는 데 걸리는 시간(초).', S.seconds),
        },
      }, { collapsed: true }),
      '문 빛': folder({
        glowColor: {
          value: G.color,
          label: '빛 색',
          hint: `문쪽 면·바닥 면·뒷면이 함께 쓰는 색.\n기본값: ${G.color}`,
        },
        glowCarpetColor: {
          value: G.carpetColor,
          label: '카펫 색',
          hint: `실내 바닥에 깔리는 카펫 색.\n기본값: ${G.carpetColor}`,
        },
        glowScale: {
          value: G.scale,
          min: 0.2,
          max: 4,
          step: 0.05,
          label: '입구 크기',
          hint: hint('문짝 대비 배율이라 1이면 문과 같다.', G.scale),
        },
        glowDepth: {
          value: G.depth,
          min: 0.05,
          max: 2,
          step: 0.05,
          label: '깊이',
          hint: hint('뒷면까지의 깊이(모델 좌표).', G.depth),
        },
        glowSharpness: {
          value: G.sharpness,
          min: 0,
          max: 1,
          step: 0.05,
          label: '밝아짐',
          hint: hint('1에 가까울수록 급격하게 밝아지고 옅은 구간이 짧아진다.', G.sharpness),
        },
        glowLength: {
          value: G.length,
          min: 0.05,
          max: 3,
          step: 0.05,
          label: '면 길이',
          hint: hint(
            '문쪽 면과 바닥 면이 안쪽으로 뻗는 길이(모델 좌표). 두 면이 같은 길이라 퍼지는 정도가 같다.',
            G.length,
          ),
        },
        glowCarpetFalloff: {
          value: G.carpetFalloff,
          min: 0,
          max: 1,
          step: 0.05,
          label: '카펫 어두워짐',
          hint: hint('카펫이 안으로 들어갈수록 어두워지는 정도.', G.carpetFalloff),
        },
      }, { collapsed: true }),
      '근접 구역': folder({
        nearForward: {
          value: N.forward,
          min: 0,
          max: 2,
          step: 0.02,
          label: '앞으로',
          hint: hint('문에서 구역 중심까지 나가는 거리(모델 좌표). 건물 배율이 곱해진다.', N.forward),
        },
        nearSize: {
          value: { x: N.width, z: N.depth },
          step: 0.02,
          joystick: false,
          label: '크기',
          hint: `구역의 가로·깊이(모델 좌표). 공통층이 근접 반경 2를 더 얹으므로 실제로는 이보다 넓게 반응한다.\n기본값: (${N.width}, ${N.depth})`,
        },
        showOutline: {
          value: false,
          label: '테두리 표시',
          hint: '근접 판정 구역을 선으로 그린다(범위 확인용).',
        },
      }, { collapsed: true }),
      '클릭 표시': folder({
        markerPosition: {
          value: { x: M.x, z: M.z },
          step: 0.01,
          joystick: false,
          label: '좌표',
          hint: `건물 중심에서 떨어진 거리(모델 좌표). 건물 배율이 곱해진다.
기본값: (${M.x}, ${M.z})`,
        },
        markerY: {
          value: M.y,
          min: 0,
          max: 2,
          step: 0.01,
          label: '높이',
          hint: hint('원뿔 끝이 놓일 높이(모델 좌표).', M.y),
        },
        markerSize: {
          value: M.size,
          min: 0.01,
          max: 0.5,
          step: 0.01,
          label: '크기',
          hint: hint('원뿔 높이(모델 좌표). 밑면은 비율로 따라온다.', M.size),
        },
      }, { collapsed: true }),
      '정면뷰': folder({
        viewDistance: {
          value: V.distance,
          min: 1,
          max: 40,
          step: 0.5,
          label: '거리',
          hint: hint('문에서 카메라까지의 거리. 직교라 배율이 아니라 잘리는 범위에만 관계한다.', V.distance),
        },
        viewHeight: {
          value: V.height,
          min: 0,
          max: 15,
          step: 0.1,
          label: '카메라 높이',
          hint: hint('카메라가 놓이는 높이(월드 y).', V.height),
        },
        viewLookY: {
          value: V.lookY,
          min: 0,
          max: 10,
          step: 0.1,
          label: '보는 높이',
          hint: hint('바라보는 점의 높이(월드 y). 문 한가운데쯤이면 문이 화면 중앙에 온다.', V.lookY),
        },
        viewZoom: {
          value: V.zoom,
          min: 1,
          max: 4,
          step: 0.05,
          label: '확대 배수',
          hint: hint('캐릭터가 들어갈 때 확대하는 배수. 1이면 그대로다.', V.zoom),
        },
        viewZoomSeconds: {
          value: V.zoomSeconds,
          min: 0.1,
          max: 5,
          step: 0.1,
          label: '확대 시간',
          hint: hint('확대에 걸리는 시간(초).', V.zoomSeconds),
        },
      }, { collapsed: true }),
      '들어가기': folder({
        enterZ: {
          value: E.z,
          min: -2,
          max: 2,
          step: 0.01,
          label: '깊이',
          hint: hint('건물 안에서 서는 깊이. 건물 중심 기준 모델 좌표이고 x는 선 자리를 그대로 둔다.', E.z),
        },
        enterSpeed: {
          value: E.speed,
          min: 0.2,
          max: 6,
          step: 0.1,
          label: '걸음 속도',
          hint: hint('들어갈 때만 쓰는 속도(유닛/초). 평소는 4다.', E.speed),
        },
      }, { collapsed: true }),
    }),
    { collapsed: true },
  )

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    'Projects 영역',
    {
      '값 복사(JSON)': button(() => {
        const { building, near, plate, marker, swing, glow, view, enter } =
          useProjectsPageStore.getState()
        const json = JSON.stringify(
          { building, near, plate, marker, swing, glow, view, enter },
          null,
          2,
        )
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() =>
        set({
          buildingHeight: B.height,
          buildingPosition: { x: B.x, z: B.z },
          buildingRotation: B.rotation,
          platePosition: { x: P.x, z: P.z },
          plateY: P.y,
          plateSize: { x: P.width, y: P.height },
          swingHingeRight: S.hingeRight,
          swingAngle: S.angle,
          swingSeconds: S.seconds,
          glowColor: G.color,
          glowCarpetColor: G.carpetColor,
          glowScale: G.scale,
          glowDepth: G.depth,
          glowSharpness: G.sharpness,
          glowLength: G.length,
          glowCarpetFalloff: G.carpetFalloff,
          nearForward: N.forward,
          nearSize: { x: N.width, z: N.depth },
          showOutline: false,
          markerPosition: { x: M.x, z: M.z },
          markerY: M.y,
          markerSize: M.size,
          viewDistance: V.distance,
          viewHeight: V.height,
          viewLookY: V.lookY,
          viewZoom: V.zoom,
          viewZoomSeconds: V.zoomSeconds,
          enterZ: E.z,
          enterSpeed: E.speed,
        }),
      ),
    },
    [set],
  )

  useEffect(() => {
    const { buildingHeight, buildingPosition, buildingRotation } = values
    setBuilding({
      height: buildingHeight,
      x: buildingPosition.x,
      z: buildingPosition.z,
      rotation: buildingRotation,
    })
  }, [values, setBuilding])

  useEffect(() => {
    const { platePosition, plateY, plateSize } = values
    setPlate({
      x: platePosition.x,
      y: plateY,
      z: platePosition.z,
      width: plateSize.x,
      height: plateSize.y,
    })
  }, [values, setPlate])

  useEffect(() => {
    const { nearForward, nearSize } = values
    setNear({
      forward: nearForward,
      width: nearSize.x,
      depth: nearSize.z,
    })
  }, [values, setNear])

  useEffect(() => {
    setShowOutline(values.showOutline)
  }, [values, setShowOutline])

  useEffect(() => {
    const { markerPosition, markerY, markerSize } = values
    setMarker({ x: markerPosition.x, y: markerY, z: markerPosition.z, size: markerSize })
  }, [values, setMarker])

  useEffect(() => {
    const { swingHingeRight, swingAngle, swingSeconds } = values
    setSwing({ hingeRight: swingHingeRight, angle: swingAngle, seconds: swingSeconds })
  }, [values, setSwing])

  useEffect(() => {
    const {
      glowColor,
      glowCarpetColor,
      glowScale,
      glowDepth,
      glowSharpness,
      glowLength,
      glowCarpetFalloff,
    } = values
    setGlow({
      color: glowColor,
      carpetColor: glowCarpetColor,
      scale: glowScale,
      depth: glowDepth,
      sharpness: glowSharpness,
      length: glowLength,
      carpetFalloff: glowCarpetFalloff,
    })
  }, [values, setGlow])

  useEffect(() => {
    const { viewDistance, viewHeight, viewLookY, viewZoom, viewZoomSeconds } = values
    setView({
      distance: viewDistance,
      height: viewHeight,
      lookY: viewLookY,
      zoom: viewZoom,
      zoomSeconds: viewZoomSeconds,
    })
  }, [values, setView])

  useEffect(() => {
    const { enterZ, enterSpeed } = values
    setEnter({ z: enterZ, speed: enterSpeed })
  }, [values, setEnter])

  return null
}
