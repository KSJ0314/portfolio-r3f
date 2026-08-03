import { useEffect } from 'react'
import { useTheme } from 'styled-components'
import { STATIONS, getSection } from '../../content/stations'
import { CAMERA_BOUNDS, useCameraStore } from '../../state/useCameraStore'
import { teleportToStand } from '../../stations/registry'
import {
  StationMarker,
  WorldMapBackdrop,
  WorldMapClose,
  WorldMapSheet,
  WorldMapSvg,
  WorldMapTitle,
} from './WorldMap.styled'
import type { WorldMapProps } from './WorldMap.types'

/**
 * 이동 범위를 회전시켜도 잘리지 않는 반지름. 정사각 범위를 45° 돌리면 대각선이 가장 길다.
 * 거기에 마커 이름이 놓일 여백을 조금 더 둔다.
 */
const MAP_RADIUS = CAMERA_BOUNDS * Math.SQRT2 + 4

/** 확대 배율. 클수록 크게 보이고 그만큼 가장자리가 잘린다. */
const ZOOM = 1.2

const VIEW_RADIUS = MAP_RADIUS / ZOOM

/** 원점(Intro)이 위에서 1/4 지점에 오도록 뷰박스를 아래로 내린다. */
const VIEW_TOP = -VIEW_RADIUS / 2

/**
 * 맵 전체를 보는 월드맵 — 미니맵을 누르면 열린다.
 *
 * 미니맵과 같은 각도(`viewAngle`)로 돌려 두 지도가 같은 방향을 가리키게 하고,
 * 이름은 회전 밖에 둬 똑바로 선 채로 유지한다.
 * 스테이션을 고르면 그 스테이션이 등록한 자리로 캐릭터를 옮기고 닫는다(활성화는 하지 않는다).
 *
 * 여는 동안에는 캐릭터가 움직이지 않으므로(입력이 이 모달에 막힌다) 좌표는 열릴 때 한 번만 읽는다.
 */
export function WorldMap({ onClose }: WorldMapProps) {
  const theme = useTheme()
  const { position, viewAngle } = useCameraStore.getState()
  const cos = Math.cos(viewAngle)
  const sin = Math.sin(viewAngle)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  /** 월드 좌표를 화면 각도에 맞춰 돌린다(거리 보존). SVG y는 아래로 증가. */
  const project = (x: number, z: number): [number, number] => [x * cos - z * sin, x * sin + z * cos]

  const [playerX, playerY] = project(position.x, position.z)

  return (
    <WorldMapBackdrop onClick={onClose}>
      <WorldMapSheet onClick={(e) => e.stopPropagation()}>
        <WorldMapTitle>월드맵</WorldMapTitle>
        <WorldMapClose type="button" onClick={onClose} aria-label="월드맵 닫기">
          ✕
        </WorldMapClose>

        <WorldMapSvg
          viewBox={`${-VIEW_RADIUS} ${VIEW_TOP} ${2 * VIEW_RADIUS} ${2 * VIEW_RADIUS}`}
        >
          {/* 자리가 정해진 스테이션만 지도에 놓는다. */}
          {STATIONS.map((station) => {
            if (!station.position) return null
            const [x, y] = project(station.position[0], station.position[1])
            return (
              <StationMarker
                key={station.id}
                transform={`translate(${x} ${y})`}
                onClick={() => {
                  teleportToStand(station)
                  onClose()
                }}
              >
                {/* 이름까지 눌리도록 판정을 넉넉하게 잡는다. */}
                <circle cx={0} cy={0} r={4} fill="transparent" strokeWidth={0} />
                <circle
                  cx={0}
                  cy={0}
                  r={1.6}
                  fill={getSection(station.sectionId).color}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                />
                <text
                  x={0}
                  y={-2.6}
                  textAnchor="middle"
                  fontFamily={theme.fonts.hand}
                  fontSize={2.8}
                  fill={theme.colors.text}
                  stroke={theme.colors.surface}
                  strokeWidth={0.5}
                  paintOrder="stroke"
                >
                  {station.short}
                </text>
              </StationMarker>
            )
          })}

          {/* 캐릭터 현재 위치 */}
          <circle
            cx={playerX}
            cy={playerY}
            r={1.8}
            fill={theme.colors.accent}
            stroke="#ffffff"
            strokeWidth={0.6}
          />
        </WorldMapSvg>
      </WorldMapSheet>
    </WorldMapBackdrop>
  )
}
