import { TROPHY_URL } from '../stations/sections/about/AboutCareer/CareerTrophy/CareerTrophy.constants'

/**
 * 자동차 모델 파일. 아직 어느 스테이션도 쓰지 않아 여기에 둔다.
 * 프로젝트 스테이션이 이 모델을 쓰게 되면 그 스테이션의 `.constants.ts`로 옮기고 여기서 가져다 쓴다.
 */
const CAR_URL = '/assets/car.glb'

/** 남의 저작물을 가져다 쓸 때 밝혀야 하는 것들. CC-BY가 요구하는 네 가지(제목·제작자·출처·라이선스)다. */
export interface AssetCredit {
  /** 원저작물의 제목. 목록과 미리보기에 그대로 쓴다. */
  title: string
  author: string
  /** 라이선스 이름. 버전까지 적는다 — 판마다 조건이 다르다. */
  license: string
  licenseUrl: string
  /** 원본을 받은 곳. 방문자가 찾아갈 수 있어야 표시의 뜻이 산다. */
  sourceUrl: string
  /** 받아 온 곳의 이름(Poly Pizza 등). */
  sourceName: string
  /** 미리보기로 띄울 모델 파일. */
  modelUrl: string
}

/**
 * 가져다 쓴 3D 에셋의 출처.
 *
 * CC-BY는 출처를 **방문자가 볼 수 있는 곳에** 밝히도록 요구하므로, 이 목록을 화면(`ui/Credits`)이 그린다.
 * 레포에만 적어 두거나 콘솔에 남기는 것으로는 표시했다고 보기 어렵다.
 * **에셋을 새로 가져오면 여기에도 한 줄 넣는다.**
 */
export const ASSET_CREDITS: AssetCredit[] = [
  {
    title: 'Trophy',
    author: 'Casey Tumbers',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://poly.pizza/m/6Xu7mttjodo',
    sourceName: 'Poly Pizza',
    modelUrl: TROPHY_URL,
  },
  {
    title: 'Car',
    author: 'Poly by Google',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://poly.pizza/m/75h3mi6uHuC',
    sourceName: 'Poly Pizza',
    modelUrl: CAR_URL,
  },
]
