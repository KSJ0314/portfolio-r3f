import { useEffect, useState } from 'react'
import { MathUtils } from 'three'
import { Crayon } from '../../../../../lib/Crayon'
import { useSkillsPageStore } from '../../../../../state/useSkillsPageStore'
import { useStationStore } from '../../../../../state/useStationStore'
import { GUIDE_ARROW, GUIDE_ARROW_STROKES, GUIDE_ARROW_Y } from './SkillsGuideArrow.constants'

/**
 * 캐릭터 시작 자리에 놓이는 바닥 안내 화살표 — Skills 스테이션 쪽을 가리킨다.
 *
 * **Intro가 닫혀 카메라 전환이 끝난 뒤**(라이프사이클이 처음 idle이 되는 시점)에 나타나며,
 * 그때 크레파스로 긋듯 처음부터 끝까지 그어진다. 한 번 나온 뒤에는 계속 종이에 남는다.
 *
 * 좌표는 그림의 **좌상단 꼭지점**이고 회전축도 그 점이다. 배율은 크기와 획 굵기에 함께 걸려,
 * 그림을 대각선으로 확대한 것과 같은 결과가 된다.
 */
export function SkillsGuideArrow() {
  const { scale, x, z, rotation, seconds } = useSkillsPageStore((s) => s.guide)
  const redraw = useSkillsPageStore((s) => s.guideRedraw)
  const [revealed, setRevealed] = useState(() => useStationStore.getState().phase === 'idle')

  // Intro 종료 애니메이션이 끝나면 라이프사이클이 idle이 된다. 한 번 나오면 되돌리지 않으므로
  // phase를 구독해 리렌더하지 않고, idle이 되는 순간만 스토어에서 직접 받는다.
  useEffect(() => {
    if (revealed) return
    return useStationStore.subscribe((state) => {
      if (state.phase === 'idle') setRevealed(true)
    })
  }, [revealed])

  if (!revealed) return null

  const width = GUIDE_ARROW.size * scale
  const height = GUIDE_ARROW.height * scale

  return (
    <group position={[x, GUIDE_ARROW_Y, z]} rotation={[0, MathUtils.degToRad(rotation), 0]}>
      <Crayon
        // 다시 그리기(HUD)는 새로 마운트해 연출을 처음부터 재생한다.
        key={redraw}
        drawing={GUIDE_ARROW_STROKES}
        // 판 중심을 좌상단에서 반크기만큼 밀어 꼭지점이 좌표에 오게 한다. 눕히면 로컬 +y가 월드 -z다.
        position={[width / 2, 0, height / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        size={width}
        height={height}
        strokeWidth={GUIDE_ARROW.strokeWidth * scale}
        color={GUIDE_ARROW.color}
        roughness={GUIDE_ARROW.roughness}
        opacity={GUIDE_ARROW.opacity}
        patchiness={GUIDE_ARROW.patchiness}
        wobbleRatio={GUIDE_ARROW.wobbleRatio}
        // 그린 그대로를 고정한다 — 스튜디오에서 뽑은 값(Crayon 기본값이 바뀌어도 유지).
        margin={1}
        reveal={seconds}
        // 길안내일 뿐이라 클릭·이동 판정에서 뺀다.
        raycast={() => null}
      />
    </group>
  )
}
