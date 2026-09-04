/**
 * 회사별 자기소개.
 *
 * 키가 곧 이력서 주소의 뒷자리이고, 지원하는 곳이 생기면 여기 한 항목을 더한다.
 * 등록되지 않은 키로 들어오면 자기소개 영역이 나오지 않는다.
 *
 * 줄바꿈은 그대로 화면에 반영된다. 문단 사이는 빈 줄로 띄운다.
 */
export const COVER_LETTERS: Record<string, string> = {
  company: '자기소개 내용',
}

/** 그 키의 자기소개. 없으면 `undefined`이고, 그러면 영역 자체를 두지 않는다. */
export function getCoverLetter(company: string | undefined): string | undefined {
  if (!company) return undefined
  return COVER_LETTERS[company]
}
