import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// 본문 폰트. 필요한 글자 범위만 받아 오는 동적 서브셋 CSS다(한글 전체를 받지 않는다).
import 'pretendard/dist/web/static/pretendard-dynamic-subset.css'
import { configureDracoDecoder } from './lib/draco'
import { Root } from './Root.tsx'

// 압축된 모델을 받기 전에 디코더 자리를 잡아 둔다(기본값이 외부 CDN이다).
configureDracoDecoder()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>,
)
