import { useCallback, useEffect, useState } from 'react'
import { fetchCollection, fetchDoc, type CollectionName, type DocBase } from './firestore'

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
      fetchCollection<T>(name)
        .then((data) => {
          if (alive) setResult({ data, error: null, forName: name })
        })
        .catch((error: unknown) => {
          if (!alive) return
          // 읽기가 실패하면 그리는 쪽은 데이터가 없는 것과 구분되지 않아 화면만 빈다.
          // 쓰는 쪽이 error를 안 봐도 원인이 남도록 여기서 알린다.
          console.error(`[firestore] ${name} 읽기 실패`, error)
          setResult({ data: [], error: error as Error, forName: name })
          // 알린 뒤에 다시 시도한다. 남은 시도가 없으면 그대로 포기한다.
          const delay = RETRY_DELAYS[retry]
          if (delay !== undefined) timer = setTimeout(() => run(retry + 1), delay)
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
      fetchDoc<T>(name, id)
        .then((data) => {
          if (alive) setResult({ data, error: null, forName: name, forId: id })
        })
        .catch((error: unknown) => {
          if (!alive) return
          // 읽기 실패를 조용히 넘기지 않는다(위 useCollection과 같은 이유).
          console.error(`[firestore] ${name}/${id} 읽기 실패`, error)
          setResult({ data: null, error: error as Error, forName: name, forId: id })
          const delay = RETRY_DELAYS[retry]
          if (delay !== undefined) timer = setTimeout(() => run(retry + 1), delay)
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
