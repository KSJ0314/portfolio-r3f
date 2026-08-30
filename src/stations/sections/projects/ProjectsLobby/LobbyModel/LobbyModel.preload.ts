import { useGLTF } from '@react-three/drei'
import { COLLECTIONS, prefetchCollection } from '../../../../../lib/firebase'
import { createLogger } from '../../../../../lib/logger'
import { LOBBY_DRACO_PATH, LOBBY_MODEL_URL } from '../ProjectsLobby.constants'

const log = createLogger('asset:lobby')

/** 미리 받기는 문 앞에 설 때마다 불릴 수 있다. 실제로 받는 것도 로그도 처음 한 번뿐이다. */
let started = false

/**
 * 로비에 필요한 것을 미리 받아 둔다(그리는 것 없음). 모델과 함께 **연단 위 책이 싣는
 * `projects`** 도 읽어 둔다 — 넘어간 뒤에 읽기 시작하면 방은 떠 있는데 책만 늦게 채워진다.
 *
 * 1.8MB라 앱이 뜰 때 받으면 첫 화면이 늦고, 전환을 시작한 뒤에 받기 시작하면 덮인 채로 오래 기다린다.
 * 그래서 건물 문 앞에 다가섰을 때 맵이 이것을 부른다.
 *
 * **파일을 먼저 내려받고 그다음 파싱을 맡긴다.** `useGLTF.preload`는 끝나는 시점을 알려주지
 * 않아 얼마나 걸렸는지 볼 수 없다. 내려받기가 끝난 뒤에 부르면 브라우저 캐시에서 읽으므로
 * 네트워크는 한 번만 탄다.
 */
export function preloadLobbyModel(): void {
  if (started) return
  started = true

  prefetchCollection(COLLECTIONS.projects)

  log('내려받기 시작 %s', LOBBY_MODEL_URL)
  const start = performance.now()

  const parse = () => useGLTF.preload(LOBBY_MODEL_URL, LOBBY_DRACO_PATH)

  void fetch(LOBBY_MODEL_URL)
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      log(
        '내려받기 끝 — %sms, %sKB',
        (performance.now() - start).toFixed(0),
        (buffer.byteLength / 1024).toFixed(0),
      )
      parse()
    })
    .catch((error: unknown) => {
      log('내려받기 실패 — %o', error)
      // 받아 두지 못했어도 파싱은 맡긴다. 들어갈 때 그쪽이 다시 시도한다.
      parse()
    })
}
