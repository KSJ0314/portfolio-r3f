import { useEffect, useRef } from 'react'
import { button, folder, useControls } from 'leva'
import {
  LOG_AREAS,
  getEnabledLogAreas,
  setEnabledLogAreas,
  type LogArea,
} from '../../../lib/logger'

/** 처음 그릴 때의 켜짐 상태. 저장된 것을 그대로 읽어 화면과 실제가 어긋나지 않게 한다. */
const initial = getEnabledLogAreas()

/**
 * 콘솔 로그를 영역별로 켜고 끄는 개발용 HUD(dev에서만 렌더된다).
 *
 * 고른 것은 그 자리에서 반영되고 `localStorage`에 남아 **새로고침해도 유지된다.**
 * 다만 앱이 뜨자마자 찍히는 몇 줄은 이 패널이 그려지기 전이라 끈 뒤에도 한 번은 나온다.
 */
export function LoggerHUD() {
  const [values, set] = useControls('로그', () => ({
    '영역': folder(
      Object.fromEntries(
        LOG_AREAS.map((area) => [
          area.key,
          {
            value: initial.includes(area.key),
            label: `${area.label} (${area.key})`,
          },
        ]),
      ),
      { collapsed: true },
    ),
  }), { collapsed: true })

  // 체크가 바뀌면 켜는 값을 다시 만든다. 첫 렌더에서도 한 번 도는데, 저장된 것과 같은 값이라
  // 달라지는 것이 없다.
  const enabled = LOG_AREAS.filter((area) => values[area.key]).map((area) => area.key)
  const key = enabled.join(',')
  const applied = useRef('')

  useEffect(() => {
    if (applied.current === key) return
    applied.current = key
    setEnabledLogAreas(enabled as LogArea[])
    // `enabled`는 매 렌더 새로 만들어지는 배열이라 의존성에 두면 매번 돈다. 문자열로 비교한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls('로그', {
    '전부 켜기': button(() =>
      set(Object.fromEntries(LOG_AREAS.map((area) => [area.key, true]))),
    ),
    '전부 끄기': button(() =>
      set(Object.fromEntries(LOG_AREAS.map((area) => [area.key, false]))),
    ),
  })

  return null
}
