import { DebugHUD } from './DebugHUD'
import { GridPaperHUD } from './GridPaperHUD'
import { IntroPageHUD } from './IntroPageHUD'

/**
 * 개발용 HUD 묶음. 디버그 상태 표시(DebugHUD)와 leva 튜닝 패널(GridPaperHUD가 패널을 그리고
 * 나머지는 폴더로 얹힌다)을 한곳에서 렌더한다.
 *
 * dev 여부 게이트는 두지 않는다 — App이 `import.meta.env.DEV`로 감싸야
 * 프로덕션 빌드에서 이 트리(leva 포함)가 죽은 코드로 걷혀 번들에 들어가지 않는다.
 */
export function DevHUD() {
  return (
    <>
      <DebugHUD />
      <GridPaperHUD />
      <IntroPageHUD />
    </>
  )
}
