import { useEffect, useRef } from 'react'
import { useCameraStore } from '../state/useCameraStore'
import { isMovementLocked, useStationStore } from '../state/useStationStore'

/**
 * 개발용 상태 HUD. 개발 중 확인이 필요한 실시간 값을 좌하단에 표시한다.
 * App에서 `import.meta.env.DEV`일 때만 렌더 → 프로덕션 번들엔 나오지 않음.
 *
 * - pos / target: 캐릭터 좌표 · 목표점
 * - speed: 실제 이동 속도(유닛/초)
 * - view: 미니맵 회전각(도)
 * - near / active: 스테이션 스토어의 근접·활성 상태
 * - phase: 활성화 라이프사이클 (idle → entering → active → exiting)
 * - locked: 진입 애니메이션 재생 중이라 캐릭터 이동이 잠긴 상태인지
 * - camera: 카메라 제어권 — follow(공통층이 캐릭터 팔로우) / station(활성 스테이션이 제어)
 */
export function DebugHUD() {
  const nearId = useStationStore((s) => s.nearId)
  const activeId = useStationStore((s) => s.activeId)
  const phase = useStationStore((s) => s.phase)
  const posRef = useRef<HTMLSpanElement>(null)
  const targetRef = useRef<HTMLSpanElement>(null)
  const speedRef = useRef<HTMLSpanElement>(null)
  const viewRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const s = useCameraStore.getState()
      const p = s.position

      if (posRef.current) posRef.current.textContent = `${p.x.toFixed(2)}, ${p.z.toFixed(2)}`
      if (targetRef.current) targetRef.current.textContent = `${s.target.x.toFixed(2)}, ${s.target.z.toFixed(2)}`
      if (speedRef.current) speedRef.current.textContent = s.motion.speed.toFixed(2)
      if (viewRef.current) viewRef.current.textContent = `${((s.viewAngle * 180) / Math.PI).toFixed(1)}°`

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 20,
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#00ff88',
        font: '12px monospace',
        lineHeight: 1.5,
        borderRadius: 8,
        whiteSpace: 'pre',
        pointerEvents: 'none',
      }}
    >
      pos:     <span ref={posRef}>0, 0</span>
      {'\n'}target:  <span ref={targetRef}>0, 0</span>
      {'\n'}speed:   <span ref={speedRef}>0</span>
      {'\n'}view:    <span ref={viewRef}>0°</span>
      {'\n'}near:    {nearId ?? '—'}
      {'\n'}active:  {activeId ?? '—'}
      {'\n'}phase:   {phase}
      {'\n'}locked:  {isMovementLocked(phase) ? 'yes' : 'no'}
      {'\n'}camera:  {activeId === null ? 'follow' : 'station'}
    </div>
  )
}
