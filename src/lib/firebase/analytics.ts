import { getAnalytics, isSupported } from 'firebase/analytics'
import { app } from './firebase'

/**
 * 방문 통계(Google Analytics) 수집을 시작한다. 결과는 Firebase 콘솔 Analytics에서 본다.
 * 페이지뷰는 GA4 향상된 측정이 브라우저 히스토리 변경까지 잡으므로 라우트마다 따로 보내지 않는다.
 */
export async function startAnalytics(): Promise<void> {
  // 개발 중 접속이 통계에 섞이면 방문자 수를 믿을 수 없다.
  if (!import.meta.env.PROD) return

  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    console.warn(
      '[analytics] VITE_FIREBASE_MEASUREMENT_ID가 비어 있어 방문 통계를 수집하지 않는다.\n' +
        'Vercel 환경변수(Production·Preview)를 확인할 것. 값은 빌드 시점에 박히므로 다시 배포해야 반영된다.',
    )
    return
  }

  try {
    // 브라우저·환경에 따라 쓸 수 없는 경우가 있다(쿠키 차단 등). 그때는 조용히 넘어간다.
    if (!(await isSupported())) return
    getAnalytics(app)
  } catch (error) {
    // 광고 차단 확장이 gtag를 막는 일이 흔하다. 통계만 빠지고 앱은 그대로 돌아야 한다.
    console.warn('[analytics] 방문 통계를 시작하지 못했다.', error)
  }
}
