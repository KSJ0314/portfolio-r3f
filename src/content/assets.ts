import { DEFAULT_PAPER_STICKER_PARAMS, type PaperStickerParams } from '../lib/PaperSticker'
import {
  RIGHT_CLICK_HINT_PARAMS,
  RIGHT_CLICK_HINT_URL,
} from '../scene/MapDecorations/RightClickHint/RightClickHint.constants'
import {
  TRAFFIC_LIGHT_PARAMS,
  TRAFFIC_LIGHT_URL,
} from '../scene/MapDecorations/TrafficLight/TrafficLight.constants'
import { EXIT_STICKER_PARAMS, EXIT_STICKER_URL } from '../stations/ExitSticker/ExitSticker.constants'
import {
  CAREER_EDUCATION,
  CAREER_PAPER_PARAMS,
  CAREER_SPEC,
  EDUCATION_URL,
  SPEC_URL,
} from '../stations/sections/about/AboutCareer/CareerPaper/CareerPaper.constants'
import {
  SKILLS_BOX_PLACEMENT,
  SKILLS_BOX_URL,
} from '../stations/sections/about/AboutSkills/SkillsBox/SkillsBox.constants'
import {
  SKILLS_LEVEL,
  SKILLS_LEVEL_ALPHA,
  SKILLS_LEVEL_URL,
} from '../stations/sections/about/AboutSkills/SkillsPages/SkillItem/SkillLevel/SkillLevel.constants'

/** 미리 구울 종이 스티커 하나. */
interface StickerAsset {
  url: string
  params: PaperStickerParams
}

/**
 * 앱이 뜰 때 미리 구워 둘 종이 스티커들.
 *
 * 필요해진 순간에 굽기 시작하면 그때 서스펜드가 걸려, 이미 떠 있던 것들이 사라졌다 돌아온다.
 * **에셋을 새로 추가하면 여기에도 한 줄 넣는다.**
 *
 * 값은 각 컴포넌트가 실제로 넘기는 것과 같아야 캐시에 적중한다(그래서 같은 순서로 펼쳐 둔다).
 * 개발용 HUD로 테두리·그림자를 조절하면 값이 달라져 그때는 새로 굽지만, 프로덕션은 늘 이 값이다.
 */
export const STICKER_ASSETS: StickerAsset[] = [
  {
    url: SKILLS_BOX_URL,
    params: {
      ...DEFAULT_PAPER_STICKER_PARAMS,
      border: SKILLS_BOX_PLACEMENT.border,
      shadowBlur: SKILLS_BOX_PLACEMENT.shadowBlur,
      shadowDistance: SKILLS_BOX_PLACEMENT.shadowDistance,
      shadowOpacity: SKILLS_BOX_PLACEMENT.shadowOpacity,
    },
  },
  {
    url: SKILLS_LEVEL_URL,
    params: {
      ...DEFAULT_PAPER_STICKER_PARAMS,
      ...SKILLS_LEVEL_ALPHA,
      border: SKILLS_LEVEL.border,
      shadowBlur: SKILLS_LEVEL.shadowBlur,
      shadowDistance: SKILLS_LEVEL.shadowDistance,
      shadowOpacity: SKILLS_LEVEL.shadowOpacity,
    },
  },
  {
    url: EXIT_STICKER_URL,
    params: { ...DEFAULT_PAPER_STICKER_PARAMS, ...EXIT_STICKER_PARAMS },
  },
  {
    url: RIGHT_CLICK_HINT_URL,
    params: { ...DEFAULT_PAPER_STICKER_PARAMS, ...RIGHT_CLICK_HINT_PARAMS },
  },
  {
    url: TRAFFIC_LIGHT_URL,
    params: { ...DEFAULT_PAPER_STICKER_PARAMS, ...TRAFFIC_LIGHT_PARAMS },
  },
  {
    url: EDUCATION_URL,
    params: {
      ...DEFAULT_PAPER_STICKER_PARAMS,
      ...CAREER_PAPER_PARAMS,
      border: CAREER_EDUCATION.border,
    },
  },
  {
    url: SPEC_URL,
    params: {
      ...DEFAULT_PAPER_STICKER_PARAMS,
      ...CAREER_PAPER_PARAMS,
      border: CAREER_SPEC.border,
    },
  },
]
