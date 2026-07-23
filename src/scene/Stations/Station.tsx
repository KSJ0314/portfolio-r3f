import type { CSSProperties } from 'react'
import { Html } from '@react-three/drei'
import { getSection, type Station as StationData } from '../../content/stations'
import { getStationEntry } from '../../stations'
import { lightTheme } from '../../theme/themes'

/** 임시 라벨 스타일. 라이트/다크 양쪽에서 읽히도록 어두운 알약 배경 + 흰 글자(플레이스홀더). */
const LABEL_STYLE: CSSProperties = {
  padding: '2px 10px',
  borderRadius: 999,
  background: 'rgba(0, 0, 0, 0.6)',
  color: '#fff',
  // 씬 안의 글씨는 손글씨다. 폰트는 낮/밤이 같으므로 테마를 구독하지 않고 토큰만 가져다 쓴다.
  fontFamily: lightTheme.fonts.hand,
  fontSize: 15,
  whiteSpace: 'nowrap',
  userSelect: 'none',
}

/**
 * 스테이션 한 개를 자기 위치에 놓는다.
 *
 * 비활성 상태의 모습은 레지스트리에 등록된 스테이션별 구현이 그린다.
 * 아직 등록되지 않은 스테이션만 임시 박스 + 이름 라벨 플레이스홀더로 그린다.
 * 좌클릭 활성화는 Stations가 레이캐스트로 판정하므로, 여기서는 userData에 id만 실어둔다.
 * 우클릭 이동은 뒤의 바닥으로 통과.
 */
export function Station({ data }: { data: StationData }) {
  const [x, z] = data.position
  const color = getSection(data.sectionId).color
  const Inactive = getStationEntry(data.id)?.Inactive

  return (
    <group position={[x, 0, z]}>
      {Inactive ? (
        <Inactive station={data} />
      ) : (
        <>
          <mesh
            position={[0, 0.7, 0]}
            userData={{ stationId: data.id }}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              document.body.style.cursor = ''
            }}
          >
            <boxGeometry args={[1.2, 1.4, 1.2]} />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* 이름 라벨 — DOM 오버레이가 포인터를 가로채 이동/클릭을 막지 않도록 pointer-events 해제. */}
          <Html position={[0, 1.9, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={LABEL_STYLE}>{data.label}</div>
          </Html>
        </>
      )}
    </group>
  )
}
