import { useEffect, useRef } from 'react'
import { useTheme } from 'styled-components'
import { useCameraStore } from '../../state/useCameraStore'
import { STATIONS, getSection } from '../../content/stations'
import { useStationStore } from '../../state/useStationStore'
import { MinimapPanel, MinimapSvg } from './Minimap.styled'

/**
 * 게임식 원형 미니맵.
 * 플레이어를 중앙에 고정하고, 주변 VIEW_RADIUS(월드 유닛) 안의 스테이션만 표시한다(맵 전체가 아니라 근처 상호작용 요소만).
 *
 * 화면의 아이소메트릭 뷰는 지면상 돌아가 보이므로, 미니맵도 같은 각도로 회전시켜 실제 화면 방향과 일치시킨다.
 * 각도는 카메라에서 유도한 store의 viewAngle을 사용(하드코딩 아님).
 * 회전은 각 마커의 상대 좌표에 직접 적용(거리 보존)하고,
 * 라벨 텍스트는 회전 그룹 밖(translate만)에 두어 똑바로 선 채로 유지한다.
 *
 * 플레이어 위치는 매 프레임 좌표만 바뀌므로 리렌더 없이 rAF로 각 마커의 transform·opacity만 직접 갱신한다.
 * 근접/선택 강조는 자주 안 바뀌므로 store 구독(리렌더)으로 처리.
 */
const VIEW_RADIUS = 16
/** 가장자리 페이드 폭(유닛). */
const FADE = 3

export function Minimap() {
  const theme = useTheme()
  const activeId = useStationStore((s) => s.activeId)
  const nearId = useStationStore((s) => s.nearId)
  const groupRefs = useRef<Record<string, SVGGElement | null>>({})

  useEffect(() => {
    let raf = 0
    const update = () => {
      const state = useCameraStore.getState()
      const pos = state.position
      const cos = Math.cos(state.viewAngle)
      const sin = Math.sin(state.viewAngle)
      for (const station of STATIONS) {
        const g = groupRefs.current[station.id]
        if (!g) continue
        const dx = station.position[0] - pos.x
        const dz = station.position[1] - pos.z
        const dist = Math.hypot(dx, dz)
        if (dist > VIEW_RADIUS) {
          g.style.opacity = '0'
          continue
        }
        // 화면 각도에 맞춘 회전(거리 보존). SVG y는 아래로 증가.
        const rx = dx * cos - dz * sin
        const ry = dx * sin + dz * cos
        g.setAttribute('transform', `translate(${rx} ${ry})`)
        g.style.opacity = String(dist > VIEW_RADIUS - FADE ? (VIEW_RADIUS - dist) / FADE : 1)
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <MinimapPanel>
      <MinimapSvg viewBox={`${-VIEW_RADIUS} ${-VIEW_RADIUS} ${2 * VIEW_RADIUS} ${2 * VIEW_RADIUS}`}>
        {/* 맵 영역 바탕 + 거리 링 */}
        <circle cx={0} cy={0} r={VIEW_RADIUS} fill={theme.colors.background} />
        <circle
          cx={0}
          cy={0}
          r={VIEW_RADIUS * 0.6}
          fill="none"
          stroke={theme.colors.border}
          strokeWidth={0.4}
          strokeDasharray="1.5 2"
        />

        {/* 상단 방향 표시(위 = 화면 안쪽/멀어지는 방향) */}
        <text
          x={0}
          y={-VIEW_RADIUS + 3.2}
          textAnchor="middle"
          fontSize={2.6}
          fontWeight={700}
          fill={theme.colors.text}
          opacity={0.5}
        >
          N
        </text>

        {/* 스테이션 마커 — 위치/표시는 rAF가 imperative로 갱신, 강조 스타일만 리렌더 */}
        {STATIONS.map((station) => {
          const color = getSection(station.sectionId).color
          const isActive = station.id === activeId
          const isNear = station.id === nearId
          return (
            <g
              key={station.id}
              ref={(el) => {
                groupRefs.current[station.id] = el
              }}
              style={{ opacity: 0 }}
            >
              <circle
                cx={0}
                cy={0}
                r={isActive ? 2.6 : 1.9}
                fill={color}
                stroke={isActive ? theme.colors.accent : isNear ? theme.colors.text : '#ffffff'}
                strokeWidth={isActive ? 1 : 0.6}
              />
              <text
                x={0}
                y={-3.2}
                textAnchor="middle"
                // 스테이션 이름은 씬 안 라벨과 같은 손글씨로 쓴다.
                fontFamily={theme.fonts.hand}
                fontSize={3}
                fill={theme.colors.text}
                stroke={theme.colors.surface}
                strokeWidth={0.5}
                paintOrder="stroke"
              >
                {station.short}
              </text>
            </g>
          )
        })}

        {/* 플레이어(항상 중앙) */}
        <circle cx={0} cy={0} r={2.1} fill={theme.colors.accent} stroke="#ffffff" strokeWidth={0.8} />
      </MinimapSvg>
    </MinimapPanel>
  )
}
