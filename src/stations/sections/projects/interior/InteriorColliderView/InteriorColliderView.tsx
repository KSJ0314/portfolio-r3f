import { Matrix4 } from 'three'
import {
  INTERIOR_COLLIDER_COLOR,
  INTERIOR_COLLIDER_DEPTH_BIAS,
  INTERIOR_COLLIDER_EXTEND_STEP,
} from './InteriorColliderView.constants'
import type { InteriorColliderKind, InteriorColliderViewProps } from './InteriorColliderView.types'

/** 늘린 몫을 그릴 때 한 장씩 내린 자리. 그리는 동안만 쓰는 값이라 한 개를 돌려 쓴다. */
const _lowered = new Matrix4()

/** 역할 색을 입힌 단색 재질. 조명을 받지 않아 지정한 색이 화면에 그대로 나온다. */
function ColliderMaterial({ kind }: { kind: InteriorColliderKind }) {
  return (
    <meshBasicMaterial
      color={INTERIOR_COLLIDER_COLOR[kind]}
      toneMapped={false}
      polygonOffset
      polygonOffsetFactor={INTERIOR_COLLIDER_DEPTH_BIAS}
      polygonOffsetUnits={INTERIOR_COLLIDER_DEPTH_BIAS}
    />
  )
}

/** 아래로 늘린 몫을 몇 장으로 나눠 그릴지. */
const layerCount = (extendDown: number) => Math.ceil(extendDown / INTERIOR_COLLIDER_EXTEND_STEP)

/**
 * 콜라이더를 눈으로 보는 개발용 표시(HUD 스위치로 켠다).
 *
 * 콜라이더는 판정에만 쓰느라 감춰져 있어 평소에는 보이지 않는다. 켜면 **역할별 단색으로 꽉 채워**
 * 그려, 어느 덩어리가 무슨 역할을 맡았고 어디에 놓였는지 그대로 드러난다.
 *
 * **판정에 쓰는 그 메시를 그대로** 쓴다 — 따로 상자를 만들어 그리면 그림과 판정이 어긋나도
 * 알아채지 못한다. 아래로 늘린 콜라이더는 늘어난 것이 메시가 아니라 규칙이라, 같은 메시를
 * 조금씩 내려 겹쳐 이어진 모양으로 보인다.
 */
export function InteriorColliderView({ parts, show }: InteriorColliderViewProps) {
  if (!show) return null

  return (
    <group>
      {parts.map(({ mesh, kind, extendDown = 0 }) => (
        <group key={mesh.uuid}>
          <mesh geometry={mesh.geometry} matrix={mesh.matrixWorld} matrixAutoUpdate={false}>
            <ColliderMaterial kind={kind} />
          </mesh>

          {Array.from({ length: layerCount(extendDown) }, (_, layer) => {
            const drop = Math.min((layer + 1) * INTERIOR_COLLIDER_EXTEND_STEP, extendDown)
            _lowered.makeTranslation(0, -drop, 0).multiply(mesh.matrixWorld)
            return (
              <mesh
                key={layer}
                geometry={mesh.geometry}
                matrix={_lowered.clone()}
                matrixAutoUpdate={false}
              >
                <ColliderMaterial kind={kind} />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}
