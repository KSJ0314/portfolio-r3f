import { useEffect, useState } from 'react'
import { fetchCollection, fetchDoc, type CollectionName, type DocBase } from './firestore'

/** 비동기 읽기 상태(로딩·에러 포함). */
export interface AsyncState<T> {
  data: T
  loading: boolean
  error: Error | null
}

/**
 * 컬렉션 전체를 읽는 훅. 문서들을 오브젝트 배열(`data`)로 반환한다.
 * `name`이 바뀌면 다시 읽는다. 예: `useCollection('profile')`.
 *
 * 로딩은 "지금 name의 결과가 아직 안 온 상태"로 파생한다.
 * effect 안에서 동기로 setState하지 않기 위함(react-hooks/set-state-in-effect).
 */
export function useCollection<T extends DocBase = DocBase>(name: CollectionName): AsyncState<T[]> {
  const [result, setResult] = useState<{ data: T[]; error: Error | null; forName: CollectionName | null }>({
    data: [],
    error: null,
    forName: null,
  })

  useEffect(() => {
    // 언마운트·name 변경 후 낡은 응답이 상태를 덮지 않게 가드
    let alive = true
    fetchCollection<T>(name)
      .then((data) => {
        if (alive) setResult({ data, error: null, forName: name })
      })
      .catch((error: unknown) => {
        if (alive) setResult({ data: [], error: error as Error, forName: name })
      })
    return () => {
      alive = false
    }
  }, [name])

  const loading = result.forName !== name
  return { data: loading ? [] : result.data, loading, error: loading ? null : result.error }
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

  useEffect(() => {
    let alive = true
    fetchDoc<T>(name, id)
      .then((data) => {
        if (alive) setResult({ data, error: null, forName: name, forId: id })
      })
      .catch((error: unknown) => {
        if (alive) setResult({ data: null, error: error as Error, forName: name, forId: id })
      })
    return () => {
      alive = false
    }
  }, [name, id])

  const loading = result.forName !== name || result.forId !== id
  return { data: loading ? null : result.data, loading, error: loading ? null : result.error }
}
