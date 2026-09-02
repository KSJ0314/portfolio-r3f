import type { PaperStickerParams } from '../../lib/PaperSticker'

export interface CreditsModalProps {
  onClose(): void
}

export interface PreviewCameraProps {
  /** 기본 자리를 y축으로 돌리는 각(도). 0이면 기본 자리 그대로다. */
  yaw: number
}

export interface CreditModelProps {
  /** 띄울 모델 파일. */
  url: string
  /**
   * 모델에 담겨 온 광원을 미리보기용으로 조절할지.
   * 실내(로비)만 자기 등으로 밝히므로 그쪽에만 준다. 다른 모델의 빛은 건드리지 않는다.
   */
  tuneLights?: boolean
  /**
   * 씬과 캐시를 나눠 따로 로드할지.
   * 씬에서 애니메이션이 도는 모델은 복제하면 그 순간의 자세와 뼈대 상태를 물려받는다.
   * 따로 로드한 것은 씬이 손본 재질도 물려받지 못하므로 여기서 같은 처리를 적용한다.
   */
  ownInstance?: boolean
}

export interface CreditStickerProps {
  /** 띄울 그림. 배경이 투명해야 모양대로 오려진다. */
  url: string
  /** 테두리·그림자 값. 씬에서 쓰는 것과 같게 줘야 실물과 같은 모습이 된다. */
  params?: Partial<PaperStickerParams>
}
