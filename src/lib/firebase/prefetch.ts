import { createLogger } from '../logger'
import { fetchCollection, type CollectionName, type DocBase } from './firestore'

const log = createLogger('data:firestore')

/**
 * 미리 읽어 둔 컬렉션.
 *
 * 값이 아니라 **읽는 중인 프로미스**를 담는다. 읽는 도중에 화면이 그것을 요구해도
 * 같은 프로미스를 기다리므로 두 번 읽지 않는다.
 */
const cache = new Map<CollectionName, Promise<DocBase[]>>()

/**
 * 화면에 필요해지기 전에 컬렉션을 미리 읽어 둔다.
 *
 * 모델을 미리 받는 것과 같은 갈래다 — 넘어간 뒤에 읽기 시작하면 그동안 화면이 비거나
 * 덮개가 더 오래 덮여 있다. 이미 읽었거나 읽는 중이면 그냥 돌아간다.
 *
 * 세션 동안 다시 읽지 않으므로 콘솔에서 문서를 고치면 새로고침해야 반영된다.
 */
export function prefetchCollection(name: CollectionName): void {
  if (cache.has(name)) return

  log('%s 미리 읽기 시작', name)
  const start = performance.now()
  const pending = fetchCollection(name)
    .then((data) => {
      log('%s 미리 읽기 끝 — 문서 %d개, %sms', name, data.length, (performance.now() - start).toFixed(0))
      return data
    })
    .catch((error: unknown) => {
      log('%s 미리 읽기 실패 — %o', name, error)
      // 담아 둔 것을 지워 화면이 요구할 때 처음부터 다시 읽게 한다.
      cache.delete(name)
      throw error
    })

  cache.set(name, pending)
}

/** 미리 읽어 둔 것이 있으면 그 프로미스를 준다. 없으면 null이다. */
export function getPrefetchedCollection<T extends DocBase = DocBase>(
  name: CollectionName,
): Promise<T[]> | null {
  return (cache.get(name) as Promise<T[]> | undefined) ?? null
}
