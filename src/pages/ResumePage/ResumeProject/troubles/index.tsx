import type { ReactNode } from 'react'
import { TROUBLES_0 } from './0'
import { TROUBLES_1 } from './1'
import { TROUBLES_2 } from './2'
import { TROUBLES_3 } from './3'

/**
 * 프로젝트 번호(`key`)의 트러블슈팅 조각들.
 *
 * 노션 페이지마다 블록 구성이 달라 데이터로 담지 않고 번호 폴더에서 직접 그린다.
 * 갈래마다 조각을 나눠 두므로 분량이 A4를 넘기면 그 갈래부터 다음 장에서 이어진다.
 * 옮기지 않은 번호는 빈 목록이고, 그 프로젝트에는 트러블슈팅이 나오지 않는다.
 */
export function projectTroubles(key: number): readonly ReactNode[] {
  switch (key) {
    case 0:
      return TROUBLES_0
    case 1:
      return TROUBLES_1
    case 2:
      return TROUBLES_2
    case 3:
      return TROUBLES_3
    default:
      return []
  }
}
