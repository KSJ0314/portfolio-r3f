import type { PaperStickerParams } from '../lib/PaperSticker'
import { CHARACTER_URL } from '../scene/CharacterModel'
import { PROJECTS_CAR_URL } from '../scene/MapDecorations/ProjectsCar/ProjectsCar.constants'
import { TROPHY_URL } from '../stations/sections/about/AboutCareer/CareerTrophy/CareerTrophy.constants'
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
import { LOBBY_MODEL_URL } from '../stations/sections/projects/ProjectsLobby/ProjectsLobby.constants'
import { PROJECTS_BUILDING_URL } from '../stations/sections/projects/ProjectsBuilding/ProjectsBuilding.constants'

/**
 * 미리보기에 무엇을 어떻게 띄우는가.
 *
 * 에셋이 모델만이 아니라 종이 스티커·크레파스 그림이기도 해서, 종류마다 그리는 법이 다르다.
 * `crosswalk`는 횡단보도와 그 곁의 신호등을 함께 세우는 한 벌이라 전용 항목으로 둔다.
 */
export type CreditPreview =
  /** `tuneLights`는 모델에 담겨 온 광원을 미리보기용으로 조절할지. 실내(로비)만 해당한다. */
  | { kind: 'model'; url: string; tuneLights?: boolean }
  | { kind: 'sticker'; url: string; params?: Partial<PaperStickerParams> }
  | { kind: 'crosswalk' }

/** 밝혀야 하는 것들. CC-BY가 요구하는 네 가지(제목·제작자·출처·라이선스)를 담는다. */
export interface AssetCredit {
  /** 원저작물의 제목. 목록과 미리보기에 그대로 쓴다. */
  title: string
  author: string
  /** 라이선스 이름. 버전까지 적는다 — 판마다 조건이 다르다. 직접 만든 것은 `직접 제작`이다. */
  license: string
  /** 라이선스 전문. 직접 만든 것은 없다. */
  licenseUrl?: string
  /** 원본을 받은 곳. 방문자가 찾아갈 수 있어야 표시의 뜻이 산다. 직접 만든 것은 없다. */
  sourceUrl?: string
  /** 받아 온 곳의 이름(Poly Pizza 등). */
  sourceName?: string
  /** 미리보기로 띄울 것. */
  preview: CreditPreview
  /**
   * 미리보기 조명에 곱할 값. 기본은 1이다.
   * 실내 모델은 밖에서 보는 것들에 맞춘 광량에서 흰 대리석이 타 안이 보이지 않는다.
   */
  lightScale?: number
  /**
   * 미리보기 크기에 곱할 값. 기본은 1이다.
   * 가장 긴 변을 1로 맞추므로, 방처럼 넓고 납작한 것은 그 기준에서 작게 잡힌다.
   */
  previewScale?: number
  /**
   * 미리보기 카메라의 시작 자리를 y축으로 돌리는 각(도). 기본은 0이다.
   * 에셋을 돌려 세우면 그 자체가 기울어지므로, 보는 자리를 옮겨 처음 보이는 면을 정한다.
   */
  cameraYaw?: number
}

/**
 * 직접 만든 것의 라이선스 자리. 남의 것이 아니므로 링크 없이 이것만 적는다.
 *
 * **만든 방식을 갈라 적는다.** 생성 도구를 쓴 결과물은 도구의 약관이 걸리고 저작권 인정 범위도
 * 달라서, 손으로 그린 것과 한 낱말로 묶으면 사실과 어긋난다.
 */
const AI_WORK = { author: '김소중', license: 'AI 생성 (GPT)' } as const
const AI_MODEL_WORK = { author: '김소중', license: 'AI 도구로 제작 (Blender + Claude MCP)' } as const
const AI_CHARACTER_WORK = { author: '김소중', license: 'AI 생성 (Meshy AI)' } as const

/**
 * 화면에 싣는 에셋 출처.
 *
 * CC-BY는 출처를 **방문자가 볼 수 있는 곳에** 밝히도록 요구하므로, 이 목록을 화면(`ui/Credits`)이 그린다.
 * 레포에만 적어 두거나 콘솔에 남기는 것으로는 표시했다고 보기 어렵다.
 * 가져다 쓴 것뿐 아니라 직접 만든 것도 함께 실어, 무엇을 만들었는지 한자리에서 보이게 한다.
 * **에셋을 새로 추가하면 여기에도 한 줄 넣는다.**
 */
export const ASSET_CREDITS: AssetCredit[] = [
  {
    title: 'Trophy',
    author: 'Casey Tumbers',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://poly.pizza/m/6Xu7mttjodo',
    sourceName: 'Poly Pizza',
    preview: { kind: 'model', url: TROPHY_URL },
  },
  {
    title: 'Car',
    author: 'Poly by Google',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://poly.pizza/m/75h3mi6uHuC',
    sourceName: 'Poly Pizza',
    preview: { kind: 'model', url: PROJECTS_CAR_URL },
  },
  // CC0는 표기 의무가 없지만, 가져다 쓴 것을 한자리에 모아 두는 편이 낫다.
  {
    title: 'Small Building',
    author: 'Kenney',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://poly.pizza/m/gyjF60t7CG',
    sourceName: 'Poly Pizza',
    preview: { kind: 'model', url: PROJECTS_BUILDING_URL },
  },
  {
    title: '공구함',
    ...AI_WORK,
    cameraYaw: -45,
    preview: {
      kind: 'sticker',
      url: SKILLS_BOX_URL,
      params: {
        border: SKILLS_BOX_PLACEMENT.border,
        shadowBlur: SKILLS_BOX_PLACEMENT.shadowBlur,
        shadowDistance: SKILLS_BOX_PLACEMENT.shadowDistance,
        shadowOpacity: SKILLS_BOX_PLACEMENT.shadowOpacity,
      },
    },
  },
  // 한 항목에 든 둘이 만든 방식이 달라 라이선스 자리에 나눠 적는다.
  {
    title: '횡단보도와 신호등',
    author: '김소중',
    license: '직접 제작 (횡단보도) · AI 생성 (신호등)',
    preview: { kind: 'crosswalk' },
    previewScale: 1.5,
    cameraYaw: -45,
  },
  {
    title: '학사모',
    ...AI_WORK,
    cameraYaw: -45,
    preview: {
      kind: 'sticker',
      url: EDUCATION_URL,
      params: { ...CAREER_PAPER_PARAMS, border: CAREER_EDUCATION.border },
    },
  },
  {
    title: '자격증',
    ...AI_WORK,
    cameraYaw: -45,
    preview: {
      kind: 'sticker',
      url: SPEC_URL,
      params: { ...CAREER_PAPER_PARAMS, border: CAREER_SPEC.border },
    },
  },
  {
    title: '캐릭터',
    ...AI_CHARACTER_WORK,
    // 재질 밝기를 씬에서 되올려 둔 데다 톤 매핑까지 빼, 여기 광량 그대로면 색이 씻긴다.
    lightScale: 0.6,
    cameraYaw: -45,
    preview: { kind: 'model', url: CHARACTER_URL },
  },
  {
    title: '프로젝트 전시관 로비',
    ...AI_MODEL_WORK,
    preview: { kind: 'model', url: LOBBY_MODEL_URL, tuneLights: true },
    lightScale: 0.5,
    previewScale: 1.8,
    cameraYaw: -45,
  },
]
