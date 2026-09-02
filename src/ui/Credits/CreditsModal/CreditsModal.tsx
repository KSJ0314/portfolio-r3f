import { type ComponentRef, Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ASSET_CREDITS, type CreditPreview } from '../../../content/credits'
import { SceneErrorBoundary } from '../../../scene/SceneErrorBoundary'
import { CreditCrosswalk } from '../CreditCrosswalk'
import { CreditModel } from '../CreditModel'
import { CreditSticker } from '../CreditSticker'
import { PreviewCamera } from '../PreviewCamera'
import {
  PREVIEW_MAX_DISTANCE,
  PREVIEW_MIN_DISTANCE,
  PREVIEW_ZOOM_SPEED,
} from '../Credits.constants'
import {
  Backdrop,
  Body,
  CloseButton,
  Detail,
  Info,
  InfoLine,
  InfoLink,
  InfoTitle,
  List,
  ListItem,
  Panel,
  Preview,
  PreviewFallback,
  Title,
} from '../Credits.styled'
import type { CreditsModalProps } from '../Credits.types'

/** 닫기 X. */
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 2 12 12M12 2 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/** 미리보기 하나. 에셋 종류마다 그리는 법이 다르다. */
function CreditPreviewObject({ preview }: { preview: CreditPreview }) {
  switch (preview.kind) {
    case 'model':
      return (
        <CreditModel
          url={preview.url}
          tuneLights={preview.tuneLights}
          ownInstance={preview.ownInstance}
        />
      )
    case 'sticker':
      return <CreditSticker url={preview.url} params={preview.params} />
    case 'crosswalk':
      return <CreditCrosswalk />
  }
}

/**
 * 출처 목록과 에셋 미리보기.
 *
 * 왼쪽에서 고른 에셋을 오른쪽에 3D로 띄우고 그 아래에 출처를 적는다.
 * 캔버스를 항목마다 두지 않고 하나만 두는 이유는, 에셋이 늘어도 무거워지지 않기 위해서다.
 */
export function CreditsModal({ onClose }: CreditsModalProps) {
  const [selected, setSelected] = useState(0)
  const credit = ASSET_CREDITS[selected]
  const light = credit.lightScale ?? 1
  // 모델을 돌리다 바깥에서 손을 떼면 브라우저가 두 지점의 공통 조상(= 배경)에 click을 준다.
  // 그래서 누른 곳이 배경이었는지 기억해 뒀다가, 배경에서 시작한 클릭만 닫기로 친다.
  const pressedBackdrop = useRef(false)
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)

  /**
   * 목록에서 고른다 — 돌리고 당겨 둔 것은 처음 자세로 되돌린다.
   * 보던 것을 다시 눌렀을 때도 되돌아가야 자세가 흐트러졌을 때 제자리로 놓을 수단이 된다.
   * (`reset`은 컨트롤이 마운트될 때의 카메라 자세를 되돌려 준다.)
   */
  const select = (index: number) => {
    setSelected(index)
    controls.current?.reset()
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <Backdrop
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pressedBackdrop.current) onClose()
      }}
    >
      <Panel>
        <Title>에셋 출처</Title>
        <CloseButton type="button" onClick={onClose} title="닫기 (ESC)" aria-label="닫기">
          <CloseIcon />
        </CloseButton>

        <Body>
          <List>
            {ASSET_CREDITS.map((item, index) => (
              <li key={item.title}>
                <ListItem type="button" $active={index === selected} onClick={() => select(index)}>
                  {item.title}
                </ListItem>
              </li>
            ))}
          </List>

          <Detail>
            <Preview>
              {/* 에셋을 못 받아도 앱 전체가 내려가지 않게 막는다. 출처 글은 그대로 남아야 한다.
                  경계는 한 번 걸리면 그 상태로 멈추므로, 고른 에셋이 바뀌면 교체해 되살린다.
                  안 그러면 하나가 실패한 뒤로는 멀쩡한 것을 골라도 계속 실패 화면만 뜬다. */}
              <SceneErrorBoundary
                key={credit.title}
                fallback={<PreviewFallback>에셋을 불러오지 못했습니다.</PreviewFallback>}
              >
                <Canvas camera={{ position: [1.5, 1.1, 2.2], fov: 38 }} dpr={[1, 2]}>
                  {/* 항목이 정한 시작 자리. 에셋을 돌리지 않고 보는 자리를 옮긴다. */}
                  <PreviewCamera yaw={credit.cameraYaw ?? 0} />
                  {/* 실내 모델은 이 광량에서 흰 대리석이 타므로 항목이 배수를 낮춰 잡는다. */}
                  <ambientLight intensity={1.6 * light} />
                  <directionalLight position={[3, 5, 2]} intensity={2.4 * light} />
                  <directionalLight position={[-3, 2, -2]} intensity={0.8 * light} />
                  <Suspense fallback={null}>
                    {/* 다른 에셋을 고르면 새로 읽어야 하므로 교체한다. */}
                    <group scale={credit.previewScale ?? 1}>
                      <CreditPreviewObject key={credit.title} preview={credit.preview} />
                    </group>
                  </Suspense>
                  {/* 가만 둬도 형태가 읽히도록 돌리고, 끌어서 원하는 면을 볼 수 있게 한다. */}
                  {/* 에셋은 늘 크기 1로 맞춰 두므로 거리 제한이 무엇을 띄우든 같게 먹는다.
                      제한이 없으면 한없이 당기거나 밀어 놓치고, 되돌릴 방법이 없다. */}
                  <OrbitControls
                    ref={controls}
                    enablePan={false}
                    minDistance={PREVIEW_MIN_DISTANCE}
                    maxDistance={PREVIEW_MAX_DISTANCE}
                    zoomSpeed={PREVIEW_ZOOM_SPEED}
                    autoRotate
                    autoRotateSpeed={1.5}
                  />
                </Canvas>
              </SceneErrorBoundary>
            </Preview>

            <Info>
              <InfoTitle>{credit.title}</InfoTitle>
              <InfoLine>by {credit.author}</InfoLine>
              {/* 직접 만든 것은 찾아갈 곳이 없어 라이선스 이름만 둔다. */}
              <InfoLine>
                {credit.licenseUrl ? (
                  <InfoLink href={credit.licenseUrl} target="_blank" rel="noreferrer">
                    {credit.license}
                  </InfoLink>
                ) : (
                  credit.license
                )}
                {credit.sourceUrl && (
                  <>
                    {' · '}
                    <InfoLink href={credit.sourceUrl} target="_blank" rel="noreferrer">
                      {credit.sourceName}
                    </InfoLink>
                  </>
                )}
              </InfoLine>
            </Info>
          </Detail>
        </Body>
      </Panel>
    </Backdrop>
  )
}
