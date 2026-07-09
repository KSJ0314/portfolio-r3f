import type { CSSProperties } from 'react'
import { Html } from '@react-three/drei'
import { getSection, type Station as StationData } from '../../content/stations'
import { useStationStore } from '../../state/useStationStore'

/** 임시 라벨 스타일. 라이트/다크 양쪽에서 읽히도록 어두운 알약 배경 + 흰 글자(플레이스홀더). */
const LABEL_STYLE: CSSProperties = {
  padding: '2px 8px',
  borderRadius: 999,
  background: 'rgba(0, 0, 0, 0.6)',
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  userSelect: 'none',
}

/**
 * 스테이션 한 개(현재는 임시 박스 + 이름 라벨 플레이스홀더).
 * 좌클릭으로 선택 토글(근접 시에만 선택됨 — 스토어가 판정). 우클릭 이동은 뒤의 바닥으로 통과.
 * 근접/선택에 따른 시각 연출은 넣지 않는다 — 실제 고유 오브젝트·상세는 이후 스테이션마다
 * `id → 전용 컴포넌트` 레지스트리로 따로 구현한다. (DECISIONS 006)
 */
export function Station({ data }: { data: StationData }) {
  const [x, z] = data.position
  const color = getSection(data.sectionId).color
  const toggleActive = useStationStore((s) => s.toggleActive)

  return (
    <group position={[x, 0, z]}>
      <mesh
        position={[0, 0.7, 0]}
        onClick={(e) => {
          e.stopPropagation()
          toggleActive(data.id)
        }}
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
    </group>
  )
}
