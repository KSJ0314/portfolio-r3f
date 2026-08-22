import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { InteriorEnvironmentProps } from './InteriorEnvironment.types'

/**
 * 실내 환경광(IBL).
 *
 * **금속이 보이는 유일한 이유가 이것이다.** 금속은 확산광이 없어 빛을 아무리 넣어도 검게 남고,
 * 비쳐 들 환경이 있어야 형태가 드러난다. 매끈한 대리석의 광택도 여기서 나온다.
 *
 * 블렌더의 World·HDRI는 glb에 담기지 않으므로 `RoomEnvironment`로 대신한다.
 * 방 모양을 코드로 세워 굽는 것이라 **받아 올 파일이 없다** — 외부 CDN 요청도 없다(DESIGN).
 *
 * 세기를 방에서 받는 이유는, 굽는 밝기는 고정이라 이것 없이는 조절할 방법이 없기 때문이다.
 */
export function InteriorEnvironment({ blur, intensity }: InteriorEnvironmentProps) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  // 굽는 것과 버리는 것을 한 이펙트에 둔다 — 굽기를 밖에 두면 정리된 뒤 다시 붙을 때
  // 이미 버린 텍스처를 물린다(StrictMode에서 이펙트가 두 번 돈다).
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const baked = pmrem.fromScene(room, blur)
    // 구운 뒤에는 원본 방과 굽는 도구가 필요 없다. 결과 텍스처는 남는다.
    room.dispose()
    pmrem.dispose()

    // 훅이 돌려준 값의 프로퍼티에 직접 대입하면 eslint가 막는다(PaperGround가 텍스처에 쓰는 것과 같은 우회).
    for (const target3D of [scene]) {
      target3D.environment = baked.texture
      target3D.environmentIntensity = intensity
    }
    return () => {
      for (const target3D of [scene]) {
        target3D.environment = null
        target3D.environmentIntensity = 1
      }
      baked.dispose()
    }
  }, [gl, scene, blur, intensity])

  return null
}
