import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import { bakeCrayonCanvas } from '../../../lib/Crayon'
import {
  BENCH_GRAINS,
  STRAINED_MS,
  measureDevicePerf,
} from '../../../scene/DevicePerfProbe'
import {
  CROSSWALK,
  CROSSWALK_PLACEMENT,
  CROSSWALK_STROKES,
} from '../../../scene/MapDecorations/Crosswalk/Crosswalk.constants'
import { PROJECTS_CAR_PLACEMENT } from '../../../scene/MapDecorations/ProjectsCar/ProjectsCar.constants'
import { RIGHT_CLICK_HINT_PLACEMENT } from '../../../scene/MapDecorations/RightClickHint/RightClickHint.constants'
import { GUIDE_ARROW_PLACEMENT } from '../../../scene/MapDecorations/SkillsGuideArrow/SkillsGuideArrow.constants'
import { TRAFFIC_LIGHT_PLACEMENT } from '../../../scene/MapDecorations/TrafficLight/TrafficLight.constants'
import { useMapDecorationsStore } from '../../../state/useMapDecorationsStore'

const G = GUIDE_ARROW_PLACEMENT
const H = RIGHT_CLICK_HINT_PLACEMENT
const C = CROSSWALK_PLACEMENT
const T = TRAFFIC_LIGHT_PLACEMENT
const R = PROJECTS_CAR_PLACEMENT

/**
 * 횡단보도를 지금 값으로 구워 PNG로 내려받는다.
 *
 * 성능이 버거운 기기에서는 그리는 연출 대신 이 파일을 붙인다(`CROSSWALK_FLAT_URL`).
 * 크기(`scale`)는 굽는 결과와 무관하다 — 크기와 획 굵기에 같은 배율이 걸려 텍스처가 같다.
 * 내려받은 파일을 `public/images/`에 그 이름으로 넣는다.
 */
function saveCrosswalkPng() {
  const canvas = bakeCrayonCanvas({
    drawing: CROSSWALK_STROKES,
    size: CROSSWALK.size,
    height: CROSSWALK.height,
    strokeWidth: CROSSWALK.strokeWidth,
    color: CROSSWALK.color,
    roughness: CROSSWALK.roughness,
    opacity: CROSSWALK.opacity,
    patchiness: CROSSWALK.patchiness,
    wobbleRatio: CROSSWALK.wobbleRatio,
    edge: CROSSWALK.edge,
    margin: 1,
  })

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'crosswalk-flat.png'
    link.click()
    URL.revokeObjectURL(url)
  })
}

/**
 * 지금 기기 성능을 재 콘솔에 찍는다.
 *
 * 앱이 쓰는 등급은 건드리지 않는다 — 값이 얼마나 나오는지 눈으로 보는 용도다.
 * 정해진 양을 그려 보고 걸린 시간을 재므로 화면 주사율과 무관하다.
 */
function logDevicePerf() {
  const { tier, elapsed } = measureDevicePerf()
  console.log(`[기기 성능] ${tier} — 알갱이 ${BENCH_GRAINS.toLocaleString()}개에 ${elapsed.toFixed(1)}ms (기준 ${STRAINED_MS}ms)`)
}

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
  const setCar = useMapDecorationsStore((s) => s.setCar)
  const redrawCar = useMapDecorationsStore((s) => s.redrawCar)

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
      '자동차': folder({
        carLength: {
          value: R.length,
          min: 0.5,
          max: 10,
          step: 0.1,
          label: '길이',
          hint: hint('차 길이(앞뒤)의 월드 크기. 가로·높이는 모델 비율에서 나온다.', R.length),
        },
        carStart: {
          value: { x: R.startX, z: R.startZ },
          step: 0.5,
          joystick: false,
          label: '등장 자리',
          hint: `차가 나타나는 자리(월드 x, z).\n기본값: (${R.startX}, ${R.startZ})`,
        },
        carEnd: {
          value: { x: R.endX, z: R.endZ },
          step: 0.5,
          joystick: false,
          label: '도착 자리',
          hint: `차가 멈추는 자리(월드 x, z).\n기본값: (${R.endX}, ${R.endZ})`,
        },
        carBoard: {
          value: { x: R.boardX, z: R.boardZ },
          step: 0.1,
          joystick: false,
          label: '타는 자리',
          hint: `차 중심에서 캐릭터가 서는 자리까지(월드 x, z).\n기본값: (${R.boardX}, ${R.boardZ})`,
        },
        carSpeed: {
          value: R.speed,
          min: 1,
          max: 30,
          step: 0.5,
          label: '속도',
          hint: hint('주행 속도(유닛/초). 캐릭터 걸음은 4다.', R.speed),
        },
        carFadeSeconds: {
          value: R.fadeSeconds,
          min: 0.1,
          max: 3,
          step: 0.1,
          label: '페이드 시간',
          hint: hint('나타나고 사라지는 데 걸리는 시간(초).', R.fadeSeconds),
        },
        carBounce: {
          value: R.bounce,
          min: 0,
          max: 0.5,
          step: 0.01,
          label: '눌림 깊이',
          hint: hint('탑승할 때 차가 눌리는 깊이(월드 단위).', R.bounce),
        },
        carBounceSeconds: {
          value: R.bounceSeconds,
          min: 0.1,
          max: 2,
          step: 0.05,
          label: '눌림 시간',
          hint: hint('눌렸다 펴지는 데 걸리는 시간(초).', R.bounceSeconds),
        },
        carBoardPause: {
          value: R.boardPause,
          min: 0,
          max: 3,
          step: 0.05,
          label: '출발 전 멈춤',
          hint: hint('다 펴진 뒤 출발까지 쉬는 시간(초).', R.boardPause),
        },
        carWheelSpin: {
          value: R.wheelSpin,
          min: -2,
          max: 2,
          step: 0.05,
          label: '바퀴 굴림',
          hint: hint(
            '굴림 배수. 1이면 굴러간 거리 그대로이고 음수면 반대 방향이다.\n' +
              '바퀴가 30° 간격 12각형이라 1에 가까우면 프레임마다 한 바퀴 가까이 돌아 거꾸로 보인다.',
            R.wheelSpin,
          ),
        },
        carMarkerY: {
          value: R.markerY,
          min: 0,
          max: 6,
          step: 0.05,
          label: '표시 높이',
          hint: hint('누르라는 표시(원뿔)의 끝이 놓일 높이(월드 y).', R.markerY),
        },
        carMarkerSize: {
          value: R.markerSize,
          min: 0.1,
          max: 3,
          step: 0.05,
          label: '표시 크기',
          hint: hint('원뿔 높이(월드 단위). 밑면은 비율로 따라온다.', R.markerSize),
        },
        carMarkerBob: {
          value: R.markerBob,
          min: 0,
          max: 1,
          step: 0.01,
          label: '표시 흔들림',
          hint: hint('위아래로 흔들리는 폭(월드 단위).', R.markerBob),
        },
        carMarkerBobSeconds: {
          value: R.markerBobSeconds,
          min: 0.2,
          max: 6,
          step: 0.1,
          label: '흔들림 주기',
          hint: hint('한 번 오르내리는 데 걸리는 시간(초).', R.markerBobSeconds),
        },
        carMarkerSpinSeconds: {
          value: R.markerSpinSeconds,
          min: 0,
          max: 12,
          step: 0.1,
          label: '회전 주기',
          hint: hint('한 바퀴 도는 데 걸리는 시간(초). 0이면 돌지 않는다.', R.markerSpinSeconds),
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
      '횡단보도 PNG 저장': button(() => saveCrosswalkPng()),
      '기기 성능 재기(콘솔)': button(() => logDevicePerf()),
      '자동차 다시 재생': button(() => redrawCar()),
      '값 복사(JSON)': button(() => {
        const {
          guide,
          hint: hintPlacement,
          crosswalk,
          trafficLight,
          car,
        } = useMapDecorationsStore.getState()
        const json = JSON.stringify(
          { guide, hint: hintPlacement, crosswalk, trafficLight, car },
          null,
          2,
        )
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
          carLength: R.length,
          carStart: { x: R.startX, z: R.startZ },
          carEnd: { x: R.endX, z: R.endZ },
          carBoard: { x: R.boardX, z: R.boardZ },
          carSpeed: R.speed,
          carFadeSeconds: R.fadeSeconds,
          carBounce: R.bounce,
          carBounceSeconds: R.bounceSeconds,
          carBoardPause: R.boardPause,
          carWheelSpin: R.wheelSpin,
          carMarkerY: R.markerY,
          carMarkerSize: R.markerSize,
          carMarkerBob: R.markerBob,
          carMarkerBobSeconds: R.markerBobSeconds,
          carMarkerSpinSeconds: R.markerSpinSeconds,
        }),
      ),
    },
    [set, redrawGuide, redrawCrosswalk, redrawCar],
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

  useEffect(() => {
    const {
      carLength,
      carStart,
      carEnd,
      carBoard,
      carSpeed,
      carFadeSeconds,
      carBounce,
      carBounceSeconds,
      carBoardPause,
      carWheelSpin,
      carMarkerY,
      carMarkerSize,
      carMarkerBob,
      carMarkerBobSeconds,
      carMarkerSpinSeconds,
    } = values
    setCar({
      length: carLength,
      startX: carStart.x,
      startZ: carStart.z,
      endX: carEnd.x,
      endZ: carEnd.z,
      boardX: carBoard.x,
      boardZ: carBoard.z,
      speed: carSpeed,
      fadeSeconds: carFadeSeconds,
      bounce: carBounce,
      bounceSeconds: carBounceSeconds,
      boardPause: carBoardPause,
      wheelSpin: carWheelSpin,
      markerY: carMarkerY,
      markerSize: carMarkerSize,
      markerBob: carMarkerBob,
      markerBobSeconds: carMarkerBobSeconds,
      markerSpinSeconds: carMarkerSpinSeconds,
    })
  }, [values, setCar])

  return null
}
