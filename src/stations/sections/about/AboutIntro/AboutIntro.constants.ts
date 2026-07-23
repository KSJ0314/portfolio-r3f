import type { StationArea } from '../../../types'

/**
 * Intro 페이지 안의 배치 값. 눈으로 맞춰야 하는 값이라 개발용 HUD로 조절한다.
 *
 * 페이지 여백(`paddingX`·`paddingY`)이 내용이 놓일 안쪽 상자를 정하고,
 * 요소별 여백은 그 상자에서 각자 얼마나 더 들어가는지를 정한다.
 */
export interface IntroPageLayout {
  /** 페이지 좌우 여백. */
  paddingX: number
  /** 페이지 상하 여백. */
  paddingY: number
  /** tagline을 상단 여백에서 얼마나 더 내릴지. */
  taglineTop: number
  /** 상단 tagline 글씨 크기. */
  taglineSize: number
  /** intro를 tagline 아래로 얼마나 띄울지. */
  introTop: number
  /** intro를 좌측 여백에서 얼마나 더 들일지. */
  introLeft: number
  /** intro 본문 글씨 크기. */
  introSize: number
  /** intro 본문 줄 간격(글씨 크기 배수). */
  introLineHeight: number
  /** 본문 왼쪽 인용 막대의 굵기. */
  quoteBarWidth: number
  /** 인용 막대와 본문 사이 간격. */
  quoteBarGap: number
  /** 사진을 하단 여백에서 얼마나 더 올릴지. */
  photoBottom: number
  /** 하단 사진 높이. 가로는 사진 비율로 따라간다. */
  photoHeight: number
  /** 나가기 화살표의 길이. 화살촉 크기는 여기에 비례한다. */
  exitArrowSize: number
  /** 나가기 화살표를 오른쪽 끝에서 얼마나 들일지. */
  exitArrowRight: number
  /** 나가기 화살표를 아래 끝에서 얼마나 올릴지. */
  exitArrowBottom: number
  /** 크레파스 색. */
  exitArrowColor: string
  /** 크레파스 획 굵기(월드 단위). */
  exitArrowStroke: number
  /** 획 가장자리가 흩어지는 정도(0~1). */
  exitArrowRoughness: number
  /** 획의 진하기(0~1). */
  exitArrowOpacity: number
}

/** 바닥과 겹쳐 깜빡이지 않도록 살짝 띄운다. 클릭 판정 면 < 테두리 < 내용 순으로 얹는다. */
export const AREA_Y = 0.005
export const OUTLINE_Y = 0.01
export const CONTENT_Y = 0.02

/** 종이에 적힌 글씨 색. */
export const INK = '#3a3a3a'

/** Intro 페이지 영역. 개발용 HUD(IntroPageHUD)로 정면뷰에서 맞춘 값이다. */
export const DEFAULT_INTRO_PAGE_AREA: StationArea = { width: 11, height: 6.5 }

/** 배치 기본값. 임시로 잡은 값이고 HUD로 맞춰 확정한다. */
export const DEFAULT_INTRO_PAGE_LAYOUT: IntroPageLayout = {
  paddingX: 0,
  paddingY: 0,
  taglineTop: 0.75,
  taglineSize: 0.5,
  introTop: 0.6,
  introLeft: 1.25,
  introSize: 0.26,
  introLineHeight: 1.6,
  quoteBarWidth: 0.06,
  quoteBarGap: 0.3,
  photoBottom: 0,
  photoHeight: 3.3,
  exitArrowSize: 0.95,
  exitArrowRight: 0.4,
  exitArrowBottom: 0.7,
  exitArrowColor: '#55bcf0',
  exitArrowStroke: 0.14,
  exitArrowRoughness: 0.55,
  exitArrowOpacity: 0.7,
}

/** 프로필 사진. 레포에 직접 넣어둔 파일이다. 비율은 불러온 이미지에서 읽으므로 여기 적지 않는다. */
export const PROFILE_PHOTO_URL = '/images/profile.png'
