import { useEffect } from 'react'
import { STICKER_ASSETS } from '../../content/assets'
import { preloadPaperSticker } from '../../lib/PaperSticker'

/**
 * 앱이 뜰 때 에셋을 미리 구워 캐시에 넣는다. 그리는 것은 없다.
 *
 * 스테이션을 열 때 그제서야 굽기 시작하면 서스펜드가 걸려, 이미 떠 있던 요소들이 사라졌다 돌아온다.
 * 목록은 `content/assets.ts`에 있고, 에셋을 추가하면 거기에 한 줄 넣으면 된다.
 */
export function AssetPreload() {
  useEffect(() => {
    for (const { url, params } of STICKER_ASSETS) preloadPaperSticker(url, params)
  }, [])

  return null
}
