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
}

export interface CreditStickerProps {
  /** 띄울 그림. 배경이 투명해야 모양대로 오려진다. */
  url: string
  /** 테두리·그림자 값. 씬에서 쓰는 것과 같게 줘야 실물과 같은 모습이 된다. */
  params?: Partial<PaperStickerParams>
}
