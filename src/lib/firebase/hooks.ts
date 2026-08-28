import { useCallback, useEffect, useState } from 'react'
import { createLogger } from '../logger'
import { fetchCollection, fetchDoc, type CollectionName, type DocBase } from './firestore'
import { getPrefetchedCollection } from './prefetch'

const log = createLogger('data:firestore')

/** 비동기 읽기 상태(로딩·에러 포함). */
export interface AsyncState<T> {
  data: T
  loading: boolean
  error: Error | null
  /** 실패한 읽기를 다시 시도한다. 자동 재시도가 포기한 뒤 방문자가 부른다. */
  refetch: () => void
}

/**
 * 실패했을 때 자동으로 다시 시도하는 간격(ms). 개수가 곧 시도 횟수이고, 다 실패하면 포기한다.
 *
 * 읽기 실패는 대개 순간적인 끊김이라 몇 번만 다시 시도해도 걷힌다.
 * 간격을 늘려가는 것은 이미 막힌 연결에 곧바로 다시 붙어 봐야 같은 결과이기 때문이다.
 *
 * **재시도는 실패를 알린 채로 돈다** — 마지막 시도까지 감춰 두면 그동안 빈 화면만 남는다.
 * 도중에 성공하면 그 자리가 내용으로 바뀐다.
 */
const RETRY_DELAYS = [600, 1800, 5000]

/**
 * 컬렉션 전체를 읽는 훅. 문서들을 오브젝트 배열(`data`)로 반환한다.
 * `name`이 바뀌면 다시 읽는다. 예: `useCollection('skills')`.
 */
export function useCollection<T extends DocBase = DocBase>(name: CollectionName): AsyncState<T[]> {
  const [result, setResult] = useState<{
    data: T[]
    error: Error | null
    forName: CollectionName | null
  }>({ data: [], error: null, forName: null })
  // 다시 시도는 이 값을 올려 effect를 다시 돌리는 것으로 한다.
  const [attempt, setAttempt] = useState(0)
  const refetch = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    // 언마운트·name 변경 후 낡은 응답이 상태를 덮지 않게 가드
    let alive = true
    let timer: ReturnType<typeof setTimeout> | undefined

    const run = (retry: number) => {
      // 미리 읽어 둔 것이 있으면 그것을 기다린다. 읽는 중이어도 같은 프로미스라 두 번 읽지 않는다.
      const prefetched = retry === 0 ? getPrefetchedCollection<T>(name) : null
      const source = prefetched ? '미리 읽어 둔 것' : retry > 0 ? `재시도 ${retry}` : '새로 읽기'
      // 걸린 시간을 함께 남긴다. 로그 사이의 간격만 보면 메인 스레드가 막혀 콜백이 밀린 것과
      // 실제로 오래 읽은 것을 구분할 수 없다.
      const start = performance.now()
      log('%s 읽기 시작 (%s)', name, source)
      ;(prefetched ?? fetchCollection<T>(name))
        .then((data) => {
          if (!alive) return
          log(
            '%s 읽기 성공 (%s) — 문서 %d개, %sms',
            name,
            source,
            data.length,
            (performance.now() - start).toFixed(0),
          )
          setResult({ data, error: null, forName: name })
        })
        .catch((error: unknown) => {
          if (!alive) return
          // 읽기가 실패하면 그리는 쪽은 데이터가 없는 것과 구분되지 않아 화면만 빈다.
          // 쓰는 쪽이 error를 안 봐도 원인이 남도록 여기서 알린다.
          console.error(`[firestore] ${name} 읽기 실패`, error)
          setResult({ data: [], error: error as Error, forName: name })
          // 알린 뒤에 다시 시도한다. 남은 시도가 없으면 그대로 포기한다.
          const delay = RETRY_DELAYS[retry]
          if (delay === undefined) log('%s 읽기 포기 — 재시도를 다 썼다', name)
          else timer = setTimeout(() => run(retry + 1), delay)
        })
    }
    run(0)

    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [name, attempt])

  // 로딩은 "지금 name의 결과가 아직 안 온 상태"로 파생한다.
  // effect 안에서 동기로 setState하지 않기 위함(react-hooks/set-state-in-effect).
  const loading = result.forName !== name
  return {
    data: loading ? [] : result.data,
    loading,
    error: loading ? null : result.error,
    refetch,
  }
}

/**
 * 문서 하나를 읽는 훅. 그 문서의 모든 필드를 오브젝트(`data`)로 반환한다(없으면 null).
 * `name`·`id`가 바뀌면 다시 읽는다. 예: `useDoc('profile', 'main')`.
 */
export function useDoc<T extends DocBase = DocBase>(
  name: CollectionName,
  id: string,
): AsyncState<T | null> {
  const [result, setResult] = useState<{
    data: T | null
    error: Error | null
    forName: CollectionName | null
    forId: string | null
  }>({ data: null, error: null, forName: null, forId: null })
  const [attempt, setAttempt] = useState(0)
  const refetch = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout> | undefined

    const run = (retry: number) => {
      log('%s/%s 읽기 시작%s', name, id, retry > 0 ? ` (재시도 ${retry})` : '')
      fetchDoc<T>(name, id)
        .then((data) => {
          if (!alive) return
          log('%s/%s 읽기 성공%s', name, id, data ? '' : ' — 문서 없음')
          setResult({ data, error: null, forName: name, forId: id })
        })
        .catch((error: unknown) => {
          if (!alive) return
          // 읽기 실패를 조용히 넘기지 않는다(위 useCollection과 같은 이유).
          console.error(`[firestore] ${name}/${id} 읽기 실패`, error)
          setResult({ data: null, error: error as Error, forName: name, forId: id })
          const delay = RETRY_DELAYS[retry]
          if (delay === undefined) log('%s/%s 읽기 포기 — 재시도를 다 썼다', name, id)
          else timer = setTimeout(() => run(retry + 1), delay)
        })
    }
    run(0)

    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [name, id, attempt])

  const loading = result.forName !== name || result.forId !== id
  return {
    data: loading ? null : result.data,
    loading,
    error: loading ? null : result.error,
    refetch,
  }
}
