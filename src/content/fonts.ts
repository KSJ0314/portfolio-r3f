/**
 * 씬 안 3D 텍스트용 폰트 파일 경로.
 *
 * 3D 텍스트(troika)는 웹폰트(woff2)가 아니라 폰트 파일을 직접 파싱하므로 ttf를 쓴다.
 * 셋 다 상용 한글 2350자로 서브셋한 것이다. 2D(DOM) 쪽 폰트는 테마의 `fonts` 토큰을 쓴다.
 */

/** 손글씨 — 씬 안 라벨·제목. */
export const HAND_FONT = '/fonts/gamja-flower/GamjaFlower-Subset.ttf'

/** 본문 — 읽어야 하는 콘텐츠. */
export const BODY_FONT = '/fonts/pretendard/Pretendard-Regular-Subset.ttf'

/** 본문 굵은 글씨. 3D 텍스트는 굵기를 합성하지 못해 파일이 따로 있어야 한다. */
export const BODY_BOLD_FONT = '/fonts/pretendard/Pretendard-Bold-Subset.ttf'
