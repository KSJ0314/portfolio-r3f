import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import { CROSSWALK_PLACEMENT } from '../../../scene/MapDecorations/Crosswalk/Crosswalk.constants'
import { RIGHT_CLICK_HINT_PLACEMENT } from '../../../scene/MapDecorations/RightClickHint/RightClickHint.constants'
import { GUIDE_ARROW_PLACEMENT } from '../../../scene/MapDecorations/SkillsGuideArrow/SkillsGuideArrow.constants'
import { TRAFFIC_LIGHT_PLACEMENT } from '../../../scene/MapDecorations/TrafficLight/TrafficLight.constants'
import { useMapDecorationsStore } from '../../../state/useMapDecorationsStore'

const G = GUIDE_ARROW_PLACEMENT
const H = RIGHT_CLICK_HINT_PLACEMENT
const C = CROSSWALK_PLACEMENT
const T = TRAFFIC_LIGHT_PLACEMENT

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number | string) {
  return `${description}\n기본값: ${value}`
}

/**
 * 맵 장식(스테이션에 속하지 않는 종이 위 요소)을 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 패널 자체(`<Leva>`)는 GridPaperHUD가 그리고, 여기서는 값만 등록해 같은 패널에 얹는다.
 * 값이 정해지면 "값 복사"로 얻은 JSON을 각 장식의 `.constants.ts` 기본값에 반영해 확정한다.
 */
export function MapDecorationsHUD() {
  const setGuide = useMapDecorationsStore((s) => s.setGuide)
  const redrawGuide = useMapDecorationsStore((s) => s.redrawGuide)
  const setHint = useMapDecorationsStore((s) => s.setHint)
  const setCrosswalk = useMapDecorationsStore((s) => s.setCrosswalk)
  const redrawCrosswalk = useMapDecorationsStore((s) => s.redrawCrosswalk)
  const setTrafficLight = useMapDecorationsStore((s) => s.setTrafficLight)

  const [values, set] = useControls(
    '맵 장식',
    () => ({
      '안내 화살표': folder({
        arrowScale: {
          value: G.scale,
          min: 0.2,
          max: 20,
          step: 0.1,
          label: '크기',
          hint: hint('기준 크기에 곱하는 배율. 획 굵기도 같이 커져 그림째 확대된다.', G.scale),
        },
        arrowPosition: {
          value: { x: G.x, z: G.z },
          step: 0.5,
          joystick: false,
          label: '좌표',
          hint: `그림 좌상단 꼭지점(월드 x, z).\n기본값: (${G.x}, ${G.z})`,
        },
        arrowRotation: {
          value: G.rotation,
          min: -180,
          max: 180,
          step: 1,
          label: '회전',
          hint: hint('y축 회전(도). 좌상단 꼭지점을 축으로 돈다.', G.rotation),
        },
        arrowSeconds: {
          value: G.seconds,
          min: 0.2,
          max: 6,
          step: 0.1,
          label: '그리는 시간',
          hint: hint('처음부터 끝까지 그어지는 데 걸리는 시간(초).', G.seconds),
        },
      }, { collapsed: true }),
      '우클릭 안내': folder({
        hintHeight: {
          value: H.height,
          min: 0.2,
          max: 8,
          step: 0.1,
          label: '세로크기',
          hint: hint('그림 세로의 월드 크기(여백 제외). 가로는 그림 비율에서 나온다.', H.height),
        },
        hintPosition: {
          value: { x: H.x, z: H.z },
          step: 0.25,
          joystick: false,
          label: '좌표',
          hint: `그림 중심(월드 x, z).\n기본값: (${H.x}, ${H.z})`,
        },
        hintRotation: {
          value: H.rotation,
          min: -180,
          max: 180,
          step: 1,
          label: '회전',
          hint: hint('y축 회전(도). 양수가 반시계다.', H.rotation),
        },
      }, { collapsed: true }),
      '횡단보도': folder({
        crossScale: {
          value: C.scale,
          min: 0.2,
          max: 20,
          step: 0.1,
          label: '크기',
          hint: hint('기준 크기에 곱하는 배율. 획 굵기도 같이 커져 그림째 확대된다.', C.scale),
        },
        crossPosition: {
          value: { x: C.x, z: C.z },
          step: 0.5,
          joystick: false,
          label: '좌표',
          hint: `그림 상단 중앙(월드 x, z).\n기본값: (${C.x}, ${C.z})`,
        },
        crossRotation: {
          value: C.rotation,
          min: -180,
          max: 180,
          step: 1,
          label: '회전',
          hint: hint('y축 회전(도). 상단 중앙을 축으로 돈다.', C.rotation),
        },
        crossSeconds: {
          value: C.seconds,
          min: 0.2,
          max: 10,
          step: 0.1,
          label: '그리는 시간',
          hint: hint('처음부터 끝까지 그어지는 데 걸리는 시간(초).', C.seconds),
        },
      }, { collapsed: true }),
      '신호등': folder({
        lightHeight: {
          value: T.height,
          min: 0.2,
          max: 10,
          step: 0.1,
          label: '세로크기',
          hint: hint('그림 세로의 월드 크기(테두리 제외). 가로는 그림 비율에서 나온다.', T.height),
        },
        lightOffset: {
          value: { x: T.offsetX, z: T.offsetZ },
          step: 0.1,
          joystick: false,
          label: '좌표',
          hint: `횡단보도 우상단 꼭지점에서 떨어진 거리(월드 x, z).\n기본값: (${T.offsetX}, ${T.offsetZ})`,
        },
        lightRotation: {
          value: T.rotation,
          min: -180,
          max: 180,
          step: 1,
          label: '회전',
          hint: hint('세운 판의 y축 회전 보정(도). 0이면 화면을 정면으로 본다.', T.rotation),
        },
        lightShadowAngle: {
          value: T.shadowAngle,
          min: -180,
          max: 180,
          step: 1,
          label: '그림자 방향',
          hint: hint('바닥 그림자가 뻗는 방향(도).', T.shadowAngle),
        },
        lightShadowLength: {
          value: T.shadowLength,
          min: 0,
          max: 3,
          step: 0.05,
          label: '그림자 길이',
          hint: hint('세운 높이 대비 눕힌 길이의 배수.', T.shadowLength),
        },
        lightShadowOpacity: {
          value: T.shadowOpacity,
          min: 0,
          max: 1,
          step: 0.01,
          label: '그림자 진하기',
          hint: hint('바닥 그림자의 진하기(0~1).', T.shadowOpacity),
        },
      }, { collapsed: true }),
    }),
    { collapsed: true },
  )

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    '맵 장식',
    {
      '화살표 다시 그리기': button(() => redrawGuide()),
      '횡단보도 다시 그리기': button(() => redrawCrosswalk()),
      '값 복사(JSON)': button(() => {
        const {
          guide,
          hint: hintPlacement,
          crosswalk,
          trafficLight,
        } = useMapDecorationsStore.getState()
        const json = JSON.stringify({ guide, hint: hintPlacement, crosswalk, trafficLight }, null, 2)
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() =>
        set({
          arrowScale: G.scale,
          arrowPosition: { x: G.x, z: G.z },
          arrowRotation: G.rotation,
          arrowSeconds: G.seconds,
          hintHeight: H.height,
          hintPosition: { x: H.x, z: H.z },
          hintRotation: H.rotation,
          crossScale: C.scale,
          crossPosition: { x: C.x, z: C.z },
          crossRotation: C.rotation,
          crossSeconds: C.seconds,
          lightHeight: T.height,
          lightOffset: { x: T.offsetX, z: T.offsetZ },
          lightRotation: T.rotation,
          lightShadowAngle: T.shadowAngle,
          lightShadowLength: T.shadowLength,
          lightShadowOpacity: T.shadowOpacity,
        }),
      ),
    },
    [set, redrawGuide, redrawCrosswalk],
  )

  useEffect(() => {
    const { arrowScale, arrowPosition, arrowRotation, arrowSeconds } = values
    setGuide({
      scale: arrowScale,
      x: arrowPosition.x,
      z: arrowPosition.z,
      rotation: arrowRotation,
      seconds: arrowSeconds,
    })
  }, [values, setGuide])

  useEffect(() => {
    const { hintHeight, hintPosition, hintRotation } = values
    setHint({
      height: hintHeight,
      x: hintPosition.x,
      z: hintPosition.z,
      rotation: hintRotation,
    })
  }, [values, setHint])

  useEffect(() => {
    const { crossScale, crossPosition, crossRotation, crossSeconds } = values
    setCrosswalk({
      scale: crossScale,
      x: crossPosition.x,
      z: crossPosition.z,
      rotation: crossRotation,
      seconds: crossSeconds,
    })
  }, [values, setCrosswalk])

  useEffect(() => {
    const {
      lightHeight,
      lightOffset,
      lightRotation,
      lightShadowAngle,
      lightShadowLength,
      lightShadowOpacity,
    } = values
    setTrafficLight({
      height: lightHeight,
      offsetX: lightOffset.x,
      offsetZ: lightOffset.z,
      rotation: lightRotation,
      shadowAngle: lightShadowAngle,
      shadowLength: lightShadowLength,
      shadowOpacity: lightShadowOpacity,
    })
  }, [values, setTrafficLight])

  return null
}
