import { Text } from '@react-three/drei'
import { BODY_FONT, HAND_FONT } from '../../../../../content/fonts'
import type { ProjectPageProps } from '../contents.types'
import {
  PLACEHOLDER_INK,
  PLACEHOLDER_SUB_INK,
  PLACEHOLDER_TEXT,
} from './PlaceholderPages.constants'

/**
 * 내용을 아직 넣지 않은 프로젝트가 쓰는 자리표시 페이지.
 *
 * 프로젝트 이름과 `1 / 3`만 적는다. 내용이 없어도 넘김이 도는 것을 눈으로 확인할 수 있고,
 * `contents/`에 그 프로젝트 폴더를 만들어 등록하면 그 칸만 실제 페이지로 갈린다.
 *
 * 글씨는 톤 매핑을 타지 않는다 — 페이지 바탕과 같은 기준이라야 적은 색이 그대로 나온다.
 */
export function PlaceholderPage({ project, index, total }: ProjectPageProps) {
  return (
    <>
      <Text
        font={HAND_FONT}
        position={[0, PLACEHOLDER_TEXT.titleY, 0.001]}
        fontSize={PLACEHOLDER_TEXT.titleSize}
        anchorX="center"
        anchorY="middle"
      >
        {project.title}
        <meshBasicMaterial color={PLACEHOLDER_INK} toneMapped={false} />
      </Text>
      <Text
        font={BODY_FONT}
        position={[0, -PLACEHOLDER_TEXT.numberY, 0.001]}
        fontSize={PLACEHOLDER_TEXT.numberSize}
        anchorX="center"
        anchorY="middle"
      >
        {`${index + 1} / ${total}`}
        <meshBasicMaterial color={PLACEHOLDER_SUB_INK} toneMapped={false} />
      </Text>
    </>
  )
}
