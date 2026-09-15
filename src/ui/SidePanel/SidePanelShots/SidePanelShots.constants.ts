/**
 * 사이드바 미리보기에서 빼는 화면의 id.
 *
 * 빼는 것은 보여주는 자리뿐이고 **PDF에는 그대로 들어간다** — 묶는 쪽은 구운 목록 전부를 받는다.
 */
export const HIDDEN_SHOT_IDS = ['intro']

/** 복사했다고 알리는 표시를 띄워 두는 시간(ms). */
export const COPIED_MS = 800

/** 채워지는 게이지 색. 테마 토큰에 초록이 없어 여기 둔다. */
export const GAUGE_COLOR = '#4caf7d'

/** 아직 누를 수 없을 때의 아이콘 색. 눌리는 색보다 물러나 있어야 기다리는 중임이 읽힌다. */
export const ICON_WAITING_COLOR = '#c4c4c4'
