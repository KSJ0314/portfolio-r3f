import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import { useCreditsPreviewStore } from '../../../state/useCreditsPreviewStore'
import { CREDIT_MODEL_LIGHT, CREDIT_STICKER_POSE } from '../../Credits/Credits.constants'

const P = CREDIT_STICKER_POSE
const L = CREDIT_MODEL_LIGHT

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number) {
  return `${description}\n기본값: ${value}`
}

/**
 * 에셋 출처 미리보기를 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 값이 정해지면 "값 복사"로 얻은 JSON을 `Credits.constants.ts`의 기본값에 반영해 확정한다.
 */
export function CreditsHUD() {
  const setSticker = useCreditsPreviewStore((s) => s.setSticker)
  const setModelLight = useCreditsPreviewStore((s) => s.setModelLight)

  const [values, set] = useControls('에셋 출처', () => ({
    '종이 스티커': folder(
      {
        tilt: {
          value: P.tilt,
          min: 0,
          max: 90,
          step: 1,
          label: '눕힌 각',
          hint: hint('0이면 화면을 정면으로 보고 서고, 90이면 바닥에 완전히 눕는다.', P.tilt),
        },
        spin: {
          value: P.spin,
          min: -180,
          max: 180,
          step: 1,
          label: '판 안 회전',
          hint: hint('눕힌 뒤 판 안에서 그림을 돌리는 각.', P.spin),
        },
      },
      { collapsed: true },
    ),
    '모델 전등': folder(
      {
        lightIntensity: {
          value: L.intensity,
          min: 0,
          max: 4,
          step: 0.05,
          label: '세기 배수',
          hint: hint('모델(glb)에 담겨 온 벽등 세기에 곱한다.', L.intensity),
        },
        lightRange: {
          value: L.range,
          min: 0.05,
          max: 2,
          step: 0.01,
          label: '닿는 거리',
          hint: hint('모델의 가장 긴 변 대비 비율. 키우면 방 안이 넓게 밝아진다.', L.range),
        },
      },
      { collapsed: true },
    ),
  }))

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    '에셋 출처',
    {
      '값 복사(JSON)': button(() => {
        const { sticker, modelLight } = useCreditsPreviewStore.getState()
        const json = JSON.stringify({ sticker, modelLight }, null, 2)
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() =>
        set({
          tilt: P.tilt,
          spin: P.spin,
          lightIntensity: L.intensity,
          lightRange: L.range,
        }),
      ),
    },
    [set],
  )

  useEffect(() => {
    setSticker({ tilt: values.tilt, spin: values.spin })
  }, [setSticker, values.tilt, values.spin])

  useEffect(() => {
    setModelLight({ intensity: values.lightIntensity, range: values.lightRange })
  }, [setModelLight, values.lightIntensity, values.lightRange])

  return null
}
