import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { STICKER_ASSETS } from '../../content/assets'
import { createLogger } from '../../lib/logger'
import { preloadPaperSticker } from '../../lib/PaperSticker'
import { CHARACTER_URL } from '../CharacterModel'

const log = createLogger('asset:sticker')
const logCharacter = createLogger('asset:character')

/**
 * 앱이 뜰 때 에셋을 미리 구워 캐시에 넣는다. 그리는 것은 없다.
 *
 * 스테이션을 열 때 그제서야 굽기 시작하면 서스펜드가 걸려, 이미 떠 있던 요소들이 사라졌다 돌아온다.
 * 목록은 `content/assets.ts`에 있고, 에셋을 추가하면 거기에 한 줄 넣으면 된다.
 *
 * 캐릭터 모델도 여기서 받는다. 이 컴포넌트가 맵 씬에만 있으므로 크레파스 스튜디오·목록 보기에서는
 * 받지 않는다.
 */
export function AssetPreload() {
  useEffect(() => {
    log('미리 굽기 시작 — %d개', STICKER_ASSETS.length)
    const start = performance.now()
    for (const { url, params } of STICKER_ASSETS) preloadPaperSticker(url, params)
    log('미리 굽기 요청 끝 — %sms', (performance.now() - start).toFixed(1))

    logCharacter('미리 받기 시작 — %s', CHARACTER_URL)
    useGLTF.preload(CHARACTER_URL)
  }, [])

  return null
}
