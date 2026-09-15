import { createContext, useContext } from 'react'

/**
 * 그림을 로고 자리로 물릴지 밖에서 정하는 값. `null`이면 스테이션이 내는 신호를 그대로 본다.
 *
 * 맵의 그림들은 스테이션이 열릴 때 나는 신호(`useSkillsSequenceStore`·`useCareerSequenceStore`)를
 * 구독해 스스로 물러난다. 그런데 목록 보기를 굽는 씬은 맵과 **동시에 떠 있으면서** 같은 컴포넌트를
 * 세우므로, 그 신호를 켜면 맵의 공구함·트로피까지 스테이션을 열지도 않았는데 함께 물러난다.
 * 굽는 쪽은 신호 대신 이 값으로 자기 트리만 덮는다.
 */
const LogoTurnContext = createContext<boolean | null>(null)

export const LogoTurnScope = LogoTurnContext.Provider

/** 밖에서 정해 준 로고 자세. `null`이면 스테이션 신호를 구독한다. */
export function useLogoTurnOverride(): boolean | null {
  return useContext(LogoTurnContext)
}
