import { useGLTF } from '@react-three/drei'

/**
 * self-host한 Draco 디코더 자리. `scripts/copy-draco.mjs`가 three 패키지에서 여기로 복사한다.
 * 결과물은 모눈종이 PNG와 같이 레포에 커밋한다.
 */
export const DRACO_DECODER_PATH = '/draco/'

/**
 * drei가 쓰는 Draco 디코더 자리를 self-host한 것으로 바꾼다. **씬을 세우는 모듈이 부른다.**
 *
 * 기본값이 gstatic CDN이라 그대로 두면 "외부 CDN 요청 없음"(DESIGN)과 어긋난다.
 * 모델마다 인자로 넘길 수도 있지만 **디코더는 모듈 하나를 공유**해서 마지막에 설정한 자리가 이긴다 —
 * 압축된 모델을 받는 동안 다른 모델이 로드되면 CDN으로 되돌아간다. 그래서 기본값 자체를 바꾼다.
 *
 * 진입점이 아니라 씬에서 부르는 것은 이 모듈이 drei를 물고 있기 때문이다.
 * 앱이 뜰 때 부르면 3D를 그리지 않는 화면(이력서)에도 three가 함께 내려온다.
 */
export function configureDracoDecoder(): void {
  useGLTF.setDecoderPath(DRACO_DECODER_PATH)
}
