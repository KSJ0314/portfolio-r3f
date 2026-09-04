/**
 * Firestore에 없이 이력서에만 싣는 기술.
 *
 * 키가 분류 이름이고 값이 그 분류의 기술 이름들이다.
 * Firestore에 이미 있는 분류면 그 줄 끝에 붙고, 없는 분류면 줄이 새로 생겨 맨 뒤에 놓인다.
 *
 * 포트폴리오 Skills에는 나오지 않는다 — 그쪽은 Firestore만 읽는다.
 */
export const EXTRA_SKILLS: Record<string, string[]> = {
  Frontend: ['TypeScript', 'jQuery'],
  Backend: ['JSP'],
}
