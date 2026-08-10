import { type ComponentRef, Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ASSET_CREDITS } from '../../content/credits'
import { SceneErrorBoundary } from '../../scene/SceneErrorBoundary'
import { CornerButton } from '../CornerButton'
import { CreditModel } from './CreditModel'
import {
  PREVIEW_MAX_DISTANCE,
  PREVIEW_MIN_DISTANCE,
  PREVIEW_ZOOM_SPEED,
} from './Credits.constants'
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
} from './Credits.styled'
import type { CreditsModalProps } from './Credits.types'

/**
 * 크리에이티브 커먼즈 로고 — 원 안에 c 두 개.
 * 유니코드 문자(U+1F16D)는 폰트 지원이 나빠 두부 글자로 뜨는 곳이 많아 직접 그린다.
 */
function CreativeCommonsIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10.27 10.01A2.6 2.6 0 1 0 10.27 13.99"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M17.07 10.01A2.6 2.6 0 1 0 17.07 13.99"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** 닫기 X. */
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 2 12 12M12 2 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/**
 * 출처 목록과 모델 미리보기.
 *
 * 왼쪽에서 고른 에셋을 오른쪽에 3D로 띄우고 그 아래에 출처를 적는다.
 * 캔버스를 항목마다 두지 않고 하나만 두는 이유는, 에셋이 늘어도 무거워지지 않기 위해서다.
 */
function CreditsModal({ onClose }: CreditsModalProps) {
  const [selected, setSelected] = useState(0)
  const credit = ASSET_CREDITS[selected]
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
              <li key={item.sourceUrl}>
                <ListItem
                  type="button"
                  $active={index === selected}
                  onClick={() => select(index)}
                >
                  {item.title}
                </ListItem>
              </li>
            ))}
          </List>

          <Detail>
            <Preview>
              {/* 모델을 못 받아도 앱 전체가 내려가지 않게 막는다. 출처 글은 그대로 남아야 한다.
                  경계는 한 번 걸리면 그 상태로 멈추므로, 고른 에셋이 바뀌면 갈아 끼워 되살린다.
                  안 그러면 하나가 실패한 뒤로는 멀쩡한 모델을 골라도 계속 실패 화면만 뜬다. */}
              <SceneErrorBoundary
                key={credit.modelUrl}
                fallback={<PreviewFallback>모델을 불러오지 못했습니다.</PreviewFallback>}
              >
                <Canvas camera={{ position: [1.5, 1.1, 1.8], fov: 38 }} dpr={[1, 2]}>
                  <ambientLight intensity={1.6} />
                  <directionalLight position={[3, 5, 2]} intensity={2.4} />
                  <directionalLight position={[-3, 2, -2]} intensity={0.8} />
                  <Suspense fallback={null}>
                    {/* 다른 에셋을 고르면 모델을 새로 읽어야 하므로 갈아 끼운다. */}
                    <CreditModel key={credit.modelUrl} url={credit.modelUrl} />
                  </Suspense>
                  {/* 가만 둬도 형태가 읽히도록 돌리고, 끌어서 원하는 면을 볼 수 있게 한다. */}
                  {/* 모델은 늘 크기 1로 맞춰 두므로 거리 제한이 모델과 무관하게 같게 먹는다.
                      제한이 없으면 한없이 당기거나 밀어 모델을 놓치고, 되돌릴 방법이 없다. */}
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
              <InfoLine>
                <InfoLink href={credit.licenseUrl} target="_blank" rel="noreferrer">
                  {credit.license}
                </InfoLink>
                {' · '}
                <InfoLink href={credit.sourceUrl} target="_blank" rel="noreferrer">
                  {credit.sourceName}
                </InfoLink>
              </InfoLine>
            </Info>
          </Detail>
        </Body>
      </Panel>
    </Backdrop>
  )
}

/**
 * 가져다 쓴 에셋의 출처를 밝히는 자리.
 *
 * CC-BY는 **방문자가 볼 수 있는 곳에** 출처를 적도록 요구하므로 화면에 둔다.
 * 버튼은 크레파스 버튼 왼쪽에 나란히 서고, 스테이션이 열려 있는 동안에는 App이 걷는다.
 */
export function Credits() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <CornerButton
        type="button"
        $slot={1}
        onClick={() => setOpen(true)}
        title="에셋 출처"
        aria-label="에셋 출처 열기"
      >
        <CreativeCommonsIcon />
      </CornerButton>
      {open && <CreditsModal onClose={() => setOpen(false)} />}
    </>
  )
}
