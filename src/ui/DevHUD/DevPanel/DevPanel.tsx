import type { CSSProperties } from 'react'
import { Leva } from 'leva'

/**
 * 패널을 좌상단에 고정. 접힌 상태의 제목 표시줄만 보인다.
 * 감싼 판이 `fixed`로 자리를 차지하므로 **좌상단 뒤로 가기 버튼 아래로 내려** 겹치지 않게 둔다.
 */
const PANEL_CONTAINER_STYLE: CSSProperties = {
  position: 'fixed',
  left: 16,
  top: 72,
  width: 360,
  zIndex: 1000,
}

/**
 * 개발용 튜닝 패널(dev에서만 렌더된다). 다른 HUD들은 값만 등록해 이 패널에 폴더로 얹힌다.
 *
 * 라우트마다 하나씩 그린다 — 맵은 `GridPaperHUD`가, 로비는 `LobbyPageHUD`가 함께 그린다.
 * 페이지가 통째로 갈리므로 둘이 동시에 뜨는 일은 없다.
 */
export function DevPanel() {
  return (
    // leva 기본 위치는 우상단이라 미니맵을 가린다.
    // fill로 부모 크기를 따르게 하고, 부모를 좌상단에 고정한다.
    <div style={PANEL_CONTAINER_STYLE}>
      <Leva
        fill
        // 펼쳐두면 화면을 크게 차지하므로 접힌 채로 시작한다.
        collapsed
        // 기본 폭(280px)에서는 라벨이 잘려 "..."로 표시된다. 넓혀서 잘림 자체를 줄인다.
        // 그래도 잘리는 라벨은 호버하면 hint 툴팁에 설명이 뜬다.
        theme={{
          sizes: { rootWidth: '360px', controlWidth: '150px' },
          // 툴팁 기본색은 반투명(그래서 뒤의 3D 씬이 비쳐 글씨가 안 읽힌다) → 불투명하게 덮는다.
          colors: { toolTipBackground: '#12131a', toolTipText: '#f2f2f5' },
        }}
        titleBar={{ title: '개발 튜닝' }}
      />
    </div>
  )
}
