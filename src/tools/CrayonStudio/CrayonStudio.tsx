import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  createCrayonCanvas,
  useCrayonStrokeInput,
  type CrayonCanvas,
  type CrayonDrawing,
  type CrayonPoint,
  type CrayonSharedParams,
} from '../../lib/Crayon'
import {
  BOARD_WORLD_SIZE,
  DEFAULT_STUDIO_PARAMS,
  FRAME_MARGIN,
  MIN_FRAME_SIDE,
  STUDIO_PIXELS,
} from './CrayonStudio.constants'
import { crayonCursor, ERASER_CURSOR } from './CrayonStudio.cursors'
import { loadStudioParams, saveStudioParams } from './CrayonStudio.storage'
import type { CrayonFrame, CrayonStudioParams } from './CrayonStudio.types'
import {
  Backdrop,
  Board,
  BoardCanvas,
  Button,
  Buttons,
  CloseButton,
  ColorInput,
  ColorRow,
  CornerGrip,
  EdgeGrip,
  Field,
  FieldHead,
  FrameBox,
  FrameLayer,
  Hint,
  IconButton,
  LaunchButton,
  Panel,
  ResetButton,
  Section,
  SectionHead,
  Sidebar,
  Slider,
  TextInput,
  Title,
  TitleLink,
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

/** 값을 범위 안으로 자른다. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** 프레임 grip — 변 넷과 모서리 넷. 문자에 든 방향(t·b·l·r)이 곧 움직이는 변이다. */
type FrameHandle = 't' | 'b' | 'l' | 'r' | 'tl' | 'tr' | 'br' | 'bl'

/**
 * 판 비율에 맞춘 기본 프레임. 여백을 **짧은 변** 기준으로 잡아, 직사각형이어도 사방 픽셀 여백이 같다.
 * (짧은 변 기준 여백을 각 축의 비율로 환산: 긴 축은 그만큼 여백 비율이 작아진다.)
 */
function defaultFrame(width: number, height: number): CrayonFrame {
  const short = Math.min(width, height)
  const mx = (FRAME_MARGIN * short) / width
  const my = (FRAME_MARGIN * short) / height
  return { x: mx, y: my, w: 1 - 2 * mx, h: 1 - 2 * my }
}

/** 프레임의 픽셀 사각형(주어진 폭·높이 기준). 정규화 사각형을 그 크기에 맞춰 편다. */
function frameRect(frame: CrayonFrame, width: number, height: number) {
  return { left: frame.x * width, top: frame.y * height, w: frame.w * width, h: frame.h * height }
}

/**
 * 판 전체(0~1) 좌표를 프레임 기준 0~1로 옮긴다.
 * 프레임을 그림보다 크게 잡은 만큼 좌표가 안쪽으로 모여 여백이 된다. 획 자체는 건드리지 않는다.
 */
function remapDrawing(drawing: CrayonDrawing, frame: CrayonFrame): CrayonDrawing {
  return drawing.map((stroke) => ({
    ...stroke,
    points: stroke.points.map(([u, v]): CrayonPoint => [
      (u - frame.x) / frame.w,
      (v - frame.y) / frame.h,
    ]),
  }))
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

/**
 * 값을 `<Crayon>` props에 그대로 넣을 수 있는 형태로 적는다.
 * size는 가로, height는 세로 월드 크기다. 프레임 픽셀 비율을 height로 실어 직사각형도 그대로 재현된다.
 * 굵기는 프레임 짧은 변 기준으로 환산해, 프레임을 키우면 획이 상대적으로 얇아진다.
 */
function formatParams(
  params: CrayonStudioParams,
  frame: CrayonFrame,
  size: { width: number; height: number },
): string {
  const strokeWidth =
    (params.widthRatio * Math.min(size.width, size.height)) / (frame.w * size.width)
  const height = (frame.h * size.height) / (frame.w * size.width)
  return [
    '{',
    `  size: ${BOARD_WORLD_SIZE},`,
    `  height: ${round(height * BOARD_WORLD_SIZE)},`,
    '  margin: 1,',
    `  color: '${params.color}',`,
    `  strokeWidth: ${round(strokeWidth * BOARD_WORLD_SIZE)},`,
    `  wobbleRatio: ${params.wobbleRatio},`,
    `  opacity: ${params.opacity},`,
    `  roughness: ${params.roughness},`,
    `  patchiness: ${params.patchiness},`,
    '}',
  ].join('\n')
}

/** 그림과 값을 한 덩어리로 적는다. 붙여 넣을 자리는 다르지만 늘 함께 옮기게 된다. */
function formatAll(
  drawing: CrayonDrawing,
  params: CrayonStudioParams,
  frame: CrayonFrame,
  size: { width: number; height: number },
): string {
  return [
    '// 그림 — CrayonDrawing',
    formatDrawing(drawing),
    '',
    '// 값 — <Crayon> props (크기를 바꾸려면 size·height·strokeWidth를 같은 배로)',
    formatParams(params, frame, size),
  ].join('\n')
}

function copy(text: string) {
  // 권한 거부 등으로 거절될 수 있다. 콘솔 출력이 있으니 조용히 넘긴다.
  navigator.clipboard?.writeText(text).catch(() => {})
  console.log(text)
}

/**
 * 그린 것을 PNG로 내려받는다. 프레임 영역만 잘라 내보내므로 프레임 여백이 그대로 사진 여백이 된다.
 * 모눈종이는 판의 CSS 배경이라 캔버스에 없다 — 획만 투명 배경에 남는다.
 */
function savePng(canvas: HTMLCanvasElement, frame: CrayonFrame) {
  const fr = frameRect(frame, canvas.width, canvas.height)
  const out = document.createElement('canvas')
  out.width = Math.max(1, Math.round(fr.w))
  out.height = Math.max(1, Math.round(fr.h))
  const octx = out.getContext('2d')
  if (octx) octx.drawImage(canvas, fr.left, fr.top, fr.w, fr.h, 0, 0, out.width, out.height)

  out.toBlob((blob) => {
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
  // 영역(프레임)은 저장하지 않는다 — 새로고침하면 기본값으로 돌아간다.
  const [frame, setFrame] = useState<CrayonFrame>(() => defaultFrame(STUDIO_PIXELS, STUDIO_PIXELS))
  // 사용자가 프레임을 직접 건드렸는지. 건드리기 전까진 판 비율에 맞춰 기본값을 다시 잡는다.
  const adjustedRef = useRef(false)
  const dragRef = useRef<{
    handle: FrameHandle
    pointerId: number
    rect: DOMRect
    startFrame: CrayonFrame
  } | null>(null)

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

  // 판 비율이 정해지면 기본 프레임을 그 비율로 다시 잡아 사방 여백을 같게 한다(사용자가 손대기 전까지만).
  useEffect(() => {
    if (adjustedRef.current) return
    setFrame(defaultFrame(size.width, size.height))
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

  // 프레임 grip을 잡는다. 어느 grip인지는 요소의 data-handle로 읽는다(렌더에서 클로저를 새로 만들지 않게).
  const onGripDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const el = boardRef.current
    if (!el) return
    e.stopPropagation()
    // 한 번이라도 직접 조절하면, 이후 판 크기가 바뀌어도 기본값으로 되돌리지 않는다.
    adjustedRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      handle: e.currentTarget.dataset.handle as FrameHandle,
      pointerId: e.pointerId,
      rect: el.getBoundingClientRect(),
      startFrame: frame,
    }
  }

  // 잡은 변(들)을 커서로 따라 옮긴다. 반대쪽 변은 그대로라 가로·세로를 따로 늘일 수 있다.
  // 프레임만 바뀌고 그림 좌표엔 손대지 않는다.
  const onGripMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const { rect, handle } = drag
    if (rect.width <= 0 || rect.height <= 0) return

    const nx = clamp((e.clientX - rect.left) / rect.width, 0, 1)
    const ny = clamp((e.clientY - rect.top) / rect.height, 0, 1)
    let { x, y, w, h } = drag.startFrame
    const right = x + w
    const bottom = y + h

    if (handle.includes('l')) {
      x = clamp(nx, 0, right - MIN_FRAME_SIDE)
      w = right - x
    }
    if (handle.includes('r')) {
      w = clamp(nx, x + MIN_FRAME_SIDE, 1) - x
    }
    if (handle.includes('t')) {
      y = clamp(ny, 0, bottom - MIN_FRAME_SIDE)
      h = bottom - y
    }
    if (handle.includes('b')) {
      h = clamp(ny, y + MIN_FRAME_SIDE, 1) - y
    }
    setFrame({ x, y, w, h })
  }

  const onGripUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    dragRef.current = null
  }

  const gripEvents = {
    onPointerDown: onGripDown,
    onPointerMove: onGripMove,
    onPointerUp: onGripUp,
    onPointerCancel: onGripUp,
  }

  const set = <K extends keyof CrayonStudioParams>(key: K, value: CrayonStudioParams[K]) =>
    setParams((prev) => ({ ...prev, [key]: value }))

  const keys = Object.keys(DEFAULT_STUDIO_PARAMS) as (keyof CrayonStudioParams)[]
  const untouched = keys.every((key) => params[key] === DEFAULT_STUDIO_PARAMS[key])

  // 오버레이는 판(0~1)에 대한 백분율로 얹는다. grip은 안 보이고 hover 커서만 바뀐다.
  const pct = (v: number) => `${v * 100}%`

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
          <FrameLayer>
            <FrameBox
              style={{ left: pct(frame.x), top: pct(frame.y), width: pct(frame.w), height: pct(frame.h) }}
            />
            {/* 변 4개 — 한 방향만 늘인다. */}
            <EdgeGrip
              $dir="ns"
              data-handle="t"
              style={{ left: pct(frame.x), top: `calc(${pct(frame.y)} - 5px)`, width: pct(frame.w), height: 11 }}
              {...gripEvents}
            />
            <EdgeGrip
              $dir="ns"
              data-handle="b"
              style={{ left: pct(frame.x), top: `calc(${pct(frame.y + frame.h)} - 5px)`, width: pct(frame.w), height: 11 }}
              {...gripEvents}
            />
            <EdgeGrip
              $dir="ew"
              data-handle="l"
              style={{ left: `calc(${pct(frame.x)} - 5px)`, top: pct(frame.y), width: 11, height: pct(frame.h) }}
              {...gripEvents}
            />
            <EdgeGrip
              $dir="ew"
              data-handle="r"
              style={{ left: `calc(${pct(frame.x + frame.w)} - 5px)`, top: pct(frame.y), width: 11, height: pct(frame.h) }}
              {...gripEvents}
            />
            {/* 모서리 4개 — 가로·세로를 함께 늘인다. */}
            <CornerGrip
              $corner="tl"
              data-handle="tl"
              style={{ left: `calc(${pct(frame.x)} - 8px)`, top: `calc(${pct(frame.y)} - 8px)`, width: 16, height: 16 }}
              {...gripEvents}
            />
            <CornerGrip
              $corner="tr"
              data-handle="tr"
              style={{ left: `calc(${pct(frame.x + frame.w)} - 8px)`, top: `calc(${pct(frame.y)} - 8px)`, width: 16, height: 16 }}
              {...gripEvents}
            />
            <CornerGrip
              $corner="br"
              data-handle="br"
              style={{ left: `calc(${pct(frame.x + frame.w)} - 8px)`, top: `calc(${pct(frame.y + frame.h)} - 8px)`, width: 16, height: 16 }}
              {...gripEvents}
            />
            <CornerGrip
              $corner="bl"
              data-handle="bl"
              style={{ left: `calc(${pct(frame.x)} - 8px)`, top: `calc(${pct(frame.y + frame.h)} - 8px)`, width: 16, height: 16 }}
              {...gripEvents}
            />
          </FrameLayer>
        </Board>

        <Sidebar>
          {/* 단독 페이지에서는 갈 곳이 자기 자신이라 링크로 걸지 않는다. */}
          <Title>
            {fullPage ? '크레파스 스튜디오' : <TitleLink to="/crayon">크레파스 스튜디오</TitleLink>}
          </Title>

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

            <Hint>점선은 그림이 저장될 영역을 나타내며 크기를 변경할 수 있습니다.</Hint>
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
                if (canvas) savePng(canvas, frame)
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
                onClick={() =>
                  copy(
                    formatAll(
                      remapDrawing(studio.current?.getDrawing() ?? [], frame),
                      params,
                      frame,
                      size,
                    ),
                  )
                }
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
