import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  createCrayonCanvas,
  useCrayonStrokeInput,
  type CrayonCanvas,
  type CrayonDrawing,
  type CrayonPoint,
  type CrayonSharedParams,
} from '../../lib/Crayon'
import { BOARD_WORLD_SIZE, DEFAULT_STUDIO_PARAMS, STUDIO_PIXELS } from './CrayonStudio.constants'
import { crayonCursor, ERASER_CURSOR } from './CrayonStudio.cursors'
import { loadStudioParams, saveStudioParams } from './CrayonStudio.storage'
import type { CrayonStudioParams } from './CrayonStudio.types'
import {
  Backdrop,
  Board,
  BoardCanvas,
  Button,
  Buttons,
  CloseButton,
  ColorInput,
  ColorRow,
  Field,
  FieldHead,
  IconButton,
  LaunchButton,
  Panel,
  ResetButton,
  SafeGuide,
  Section,
  SectionHead,
  Sidebar,
  Slider,
  TextInput,
  Title,
  ToolRow,
} from './CrayonStudio.styled'

/** 손으로 그은 경로라 점이 촘촘하다. 이만큼 움직여야 점으로 남겨 좌표 목록이 지나치게 길어지지 않게 한다. */
const MIN_DISTANCE = 0.006

/** 지우개가 획을 집는 반경(px). 획이 얇아도 집기 힘들지 않게 최소치를 둔다. */
const ERASE_RADIUS_MIN = 10

/** 좌표를 소수 셋째 자리까지만 남긴다. 그 아래는 알갱이 크기보다 작아 눈에 띄지 않는다. */
function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

/**
 * 툴의 비율 값을 캔버스 픽셀 기준 획 파라미터로 바꾼다.
 * 굵기의 기준은 판의 **짧은 변**이다 — 판이 가로로 길어져도 획이 함께 굵어지지 않게.
 */
function toSharedParams(params: CrayonStudioParams, reference: number): CrayonSharedParams {
  const width = params.widthRatio * reference
  return {
    color: params.color,
    width,
    wobble: width * params.wobbleRatio,
    opacity: params.opacity,
    roughness: params.roughness,
    patchiness: params.patchiness,
  }
}

/** 판의 화면 비율에 맞춘 캔버스 픽셀 크기. 짧은 변을 기준 해상도로 고정한다. */
function canvasSize(boardWidth: number, boardHeight: number) {
  if (boardWidth <= 0 || boardHeight <= 0) return { width: STUDIO_PIXELS, height: STUDIO_PIXELS }

  const scale = STUDIO_PIXELS / Math.min(boardWidth, boardHeight)
  return {
    width: Math.round(boardWidth * scale),
    height: Math.round(boardHeight * scale),
  }
}

/** 그림을 코드에 붙여 넣을 수 있는 형태로 적는다(`CrayonDrawing` 리터럴). */
function formatDrawing(drawing: CrayonDrawing): string {
  const lines = drawing.map(({ points, seed, color }) => {
    const list = points.map(([x, y]) => `[${round(x)}, ${round(y)}]`).join(', ')
    return `  { points: [${list}], seed: ${seed}, color: '${color}' },`
  })
  return `[\n${lines.join('\n')}\n]`
}

/** 값을 `<Crayon>` props에 그대로 넣을 수 있는 형태로 적는다. */
function formatParams(params: CrayonStudioParams): string {
  return [
    '{',
    `  size: ${BOARD_WORLD_SIZE},`,
    '  margin: 1,',
    `  color: '${params.color}',`,
    `  strokeWidth: ${round(params.widthRatio * BOARD_WORLD_SIZE)},`,
    `  wobbleRatio: ${params.wobbleRatio},`,
    `  opacity: ${params.opacity},`,
    `  roughness: ${params.roughness},`,
    `  patchiness: ${params.patchiness},`,
    '}',
  ].join('\n')
}

/** 그림과 값을 한 덩어리로 적는다. 붙여 넣을 자리는 다르지만 늘 함께 옮기게 된다. */
function formatAll(drawing: CrayonDrawing, params: CrayonStudioParams): string {
  return [
    '// 그림 — CrayonDrawing',
    formatDrawing(drawing),
    '',
    '// 값 — <Crayon> props (크기를 바꾸려면 size와 strokeWidth를 같은 배로)',
    formatParams(params),
  ].join('\n')
}

function copy(text: string) {
  // 권한 거부 등으로 거절될 수 있다. 콘솔 출력이 있으니 조용히 넘긴다.
  navigator.clipboard?.writeText(text).catch(() => {})
  console.log(text)
}

/**
 * 그린 것을 PNG로 내려받는다.
 * 모눈종이는 판의 CSS 배경이라 캔버스에 없다 — 획만 투명 배경에 남는다.
 */
function savePng(canvas: HTMLCanvasElement) {
  canvas.toBlob((blob) => {
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `crayon-${Date.now()}.png`
    link.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

/** 닫기 X. */
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M2 2 12 12M12 2 2 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** 도구 버튼 아이콘. 커서와 같은 방향으로 눕혀 무엇을 쥐는지 바로 읽히게 한다. */
function CrayonToolIcon({ color }: { color: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
      <g transform="rotate(-38 12 12)">
        <path
          d="M9.6 7 Q12 3.6 14.4 7 L15.6 10.2 V19 a1.2 1.2 0 0 1 -1.2 1.2 H9.6 a1.2 1.2 0 0 1 -1.2 -1.2 V10.2 Z"
          fill={color}
          stroke="#3a3a3a"
          strokeOpacity={0.45}
          strokeWidth={0.8}
        />
        <path
          d="M8.4 13 H15.6 V19 a1.2 1.2 0 0 1 -1.2 1.2 H9.6 a1.2 1.2 0 0 1 -1.2 -1.2 Z"
          fill="#000"
          fillOpacity={0.16}
        />
      </g>
    </svg>
  )
}

function EraserToolIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
      <g transform="rotate(-38 12 12)">
        <rect
          x="8"
          y="6.5"
          width="8"
          height="12"
          rx="1.6"
          fill="#fdfaf7"
          stroke="#3a3a3a"
          strokeOpacity={0.45}
          strokeWidth={0.8}
        />
        <path
          d="M8 12 h8 v4.9 a1.6 1.6 0 0 1 -1.6 1.6 h-4.8 a1.6 1.6 0 0 1 -1.6 -1.6 Z"
          fill="#8fb3cc"
        />
      </g>
    </svg>
  )
}


interface StudioModalProps {
  /** 닫는 방법. 없으면 단독 페이지로 보고 X·ESC를 두지 않는다. */
  onClose?(): void
}

/** 그림판과 조절판. 맵 위에 뜨는 모달로도, 단독 페이지로도 쓴다. */
export function StudioModal({ onClose }: StudioModalProps) {
  const boardRef = useRef<HTMLCanvasElement>(null)
  const studio = useRef<CrayonCanvas | null>(null)

  // 지난번에 쓰던 값으로 시작한다. 저장된 게 없거나 망가졌으면 기본값이 온다.
  const [params, setParams] = useState<CrayonStudioParams>(loadStudioParams)
  const [strokeCount, setStrokeCount] = useState(0)
  const [size, setSize] = useState({ width: STUDIO_PIXELS, height: STUDIO_PIXELS })
  const [erasing, setErasing] = useState(false)

  // 캔버스는 한 번만 만든다. 크기·값은 아래 이펙트들이 곧바로 채우므로 여기서 넘기지 않는다.
  useLayoutEffect(() => {
    const canvas = boardRef.current
    if (!canvas) return

    studio.current = createCrayonCanvas(canvas)
    return () => {
      studio.current = null
    }
  }, [])

  // 판이 정사각이 아닐 수 있으므로 화면 비율을 재서 캔버스도 같은 비로 맞춘다.
  useLayoutEffect(() => {
    const canvas = boardRef.current
    if (!canvas) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize(canvasSize(width, height))
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    studio.current?.resize(size.width, size.height)
  }, [size])

  useEffect(() => {
    studio.current?.setParams(toSharedParams(params, Math.min(size.width, size.height)))
  }, [params, size])

  useEffect(() => {
    saveStudioParams(params)
  }, [params])

  // 스테이션도 ESC를 듣고 있으므로, 모달이 떠 있는 동안은 여기서 가로채 뒤로 넘기지 않는다.
  useEffect(() => {
    if (!onClose) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [onClose])

  const syncCount = () => setStrokeCount(studio.current?.getStrokeCount() ?? 0)

  // 지우개는 획 하나를 통째로 집어낸다. 굵기에 따라 집는 반경이 달라지므로 함께 계산한다.
  const eraseRadius = Math.max(
    ERASE_RADIUS_MIN,
    (params.widthRatio * Math.min(size.width, size.height)) / 2,
  )

  const input = useCrayonStrokeInput({
    minDistance: MIN_DISTANCE,
    onBegin: () => {
      if (!erasing) studio.current?.begin(Math.floor(Math.random() * 10000))
    },
    onExtend: (points) => {
      if (!erasing) {
        studio.current?.extend(points)
        return
      }

      // 훑고 지나간 획을 전부 지운다.
      const erased = points.reduce(
        (any, point) => (studio.current?.eraseAt(point, eraseRadius) ? true : any),
        false,
      )
      if (erased) syncCount()
    },
    onEnd: () => {
      if (erasing) return
      studio.current?.end()
      syncCount()
    },
  })

  const toPoint = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>): CrayonPoint => {
      const rect = event.currentTarget.getBoundingClientRect()
      return [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height]
    },
    [],
  )

  const set = <K extends keyof CrayonStudioParams>(key: K, value: CrayonStudioParams[K]) =>
    setParams((prev) => ({ ...prev, [key]: value }))

  const keys = Object.keys(DEFAULT_STUDIO_PARAMS) as (keyof CrayonStudioParams)[]
  const untouched = keys.every((key) => params[key] === DEFAULT_STUDIO_PARAMS[key])

  // 알갱이는 중심선에서 굵기의 절반만큼 퍼지고 손떨림이 거기서 더 밀어낸다. 그만큼이 가장자리 여백이다.
  // 픽셀로는 사방이 같지만 축마다 캔버스 길이가 달라 비율은 갈린다.
  const safeMargin = params.widthRatio * Math.min(size.width, size.height) * (0.5 + params.wobbleRatio)

  // 닫을 데가 없다는 건 곧 단독 페이지라는 뜻이다. 모달 껍데기를 벗고 화면을 꽉 채운다.
  const fullPage = !onClose

  return (
    <Backdrop $fullPage={fullPage}>
      <Panel $fullPage={fullPage}>
        {onClose && (
          <CloseButton type="button" onClick={onClose} title="닫기 (ESC)" aria-label="닫기">
            <CloseIcon />
          </CloseButton>
        )}
        <Board $fullPage={fullPage}>
          <BoardCanvas
            ref={boardRef}
            $cursor={erasing ? ERASER_CURSOR : crayonCursor(params.color)}
            onPointerDown={(e) => {
              if (e.button !== 0) return
              // 판 밖으로 나가도 획이 끊기지 않게 포인터를 붙들어 둔다.
              e.currentTarget.setPointerCapture(e.pointerId)
              input.start(toPoint(e))
            }}
            onPointerMove={(e) => input.move(toPoint(e))}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId)
              input.stop()
            }}
            onPointerCancel={() => input.stop()}
          />
          <SafeGuide $insetX={safeMargin / size.width} $insetY={safeMargin / size.height} />
        </Board>

        <Sidebar>
          <Title>크레파스 스튜디오</Title>

          <Section>
            <SectionHead>
              크레파스
              <ResetButton
                type="button"
                onClick={() => setParams(DEFAULT_STUDIO_PARAMS)}
                disabled={untouched}
              >
                기본값
              </ResetButton>
            </SectionHead>

            <Field>
              <FieldHead>
                <span>색</span>
                <span>{params.color}</span>
              </FieldHead>
              <ColorRow>
                <ColorInput
                  type="color"
                  value={params.color}
                  onChange={(e) => set('color', e.target.value)}
                />
                <TextInput value={params.color} onChange={(e) => set('color', e.target.value)} />
              </ColorRow>
            </Field>

            <Field>
              <FieldHead>
                <span>획 굵기 (캔버스 대비)</span>
                <span>{params.widthRatio}</span>
              </FieldHead>
              <Slider
                type="range"
                min={0.005}
                max={0.25}
                step={0.001}
                value={params.widthRatio}
                onChange={(e) => set('widthRatio', Number(e.target.value))}
              />
            </Field>

            <Field>
              <FieldHead>
                <span>손떨림 (굵기 대비)</span>
                <span>{params.wobbleRatio}</span>
              </FieldHead>
              <Slider
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={params.wobbleRatio}
                onChange={(e) => set('wobbleRatio', Number(e.target.value))}
              />
            </Field>

            <Field>
              <FieldHead>
                <span>진하기</span>
                <span>{params.opacity}</span>
              </FieldHead>
              <Slider
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={params.opacity}
                onChange={(e) => set('opacity', Number(e.target.value))}
              />
            </Field>

            <Field>
              <FieldHead>
                <span>거칠기</span>
                <span>{params.roughness}</span>
              </FieldHead>
              <Slider
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={params.roughness}
                onChange={(e) => set('roughness', Number(e.target.value))}
              />
            </Field>

            <Field>
              <FieldHead>
                <span>끊김</span>
                <span>{params.patchiness}</span>
              </FieldHead>
              <Slider
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={params.patchiness}
                onChange={(e) => set('patchiness', Number(e.target.value))}
              />
            </Field>
          </Section>

          <ToolRow>
            <IconButton
              type="button"
              $active={!erasing}
              onClick={() => setErasing(false)}
              aria-label="그리기"
            >
              <CrayonToolIcon color={params.color} />
            </IconButton>
            <IconButton
              type="button"
              $active={erasing}
              onClick={() => setErasing(true)}
              aria-label="지우개"
            >
              <EraserToolIcon />
            </IconButton>
          </ToolRow>

          <Buttons>
            <Button
              onClick={() => {
                studio.current?.undo()
                syncCount()
              }}
              disabled={strokeCount === 0}
            >
              실행 취소
            </Button>
            <Button
              onClick={() => {
                studio.current?.clear()
                syncCount()
              }}
              disabled={strokeCount === 0}
            >
              전체 지우기
            </Button>
            <Button
              $wide
              onClick={() => {
                const drawing = studio.current?.getDrawing() ?? []
                studio.current?.load(
                  drawing.map(({ points, color }) => ({
                    points,
                    color,
                    seed: Math.floor(Math.random() * 10000),
                  })),
                )
              }}
              disabled={strokeCount === 0}
            >
              질감 다시 그리기
            </Button>
            <Button
              $wide
              $primary
              onClick={() => {
                const canvas = boardRef.current
                if (canvas) savePng(canvas)
              }}
              disabled={strokeCount === 0}
            >
              PNG 저장
            </Button>
            {/* 코드에 붙여 넣을 좌표라 개발 중에만 쓴다. 프로덕션 빌드에선 죽은 코드로 걷힌다. */}
            {import.meta.env.DEV && (
              <Button
                $wide
                $primary
                onClick={() => copy(formatAll(studio.current?.getDrawing() ?? [], params))}
              >
                그림 · 값 복사
              </Button>
            )}
          </Buttons>
        </Sidebar>
      </Panel>
    </Backdrop>
  )
}

/**
 * 크레파스 그림을 마우스로 그려 코드에 붙여 쓸 좌표를 뽑는 개발용 툴.
 *
 * 씬과 무관한 모달이라 카메라·스테이션에 얽히지 않는다. 판에는 실제 바닥과 같은 모눈종이를 깔아
 * 종이 위에서 어떻게 보이는지 그대로 확인한다. 결과는 `CrayonDrawing` 리터럴과 `<Crayon>` props로
 * 나눠 복사한다 — 그림은 재사용 단위이고, 색·굵기는 쓰는 쪽이 정하는 값이라 섞지 않는다.
 */
export function CrayonStudio() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <LaunchButton
        type="button"
        onClick={() => setOpen(true)}
        title="크레파스 스튜디오"
        aria-label="크레파스 스튜디오 열기"
      >
        <CrayonToolIcon color={DEFAULT_STUDIO_PARAMS.color} />
      </LaunchButton>
      {open && <StudioModal onClose={() => setOpen(false)} />}
    </>
  )
}
