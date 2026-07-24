/**
 * 그림판 위의 마우스 커서.
 *
 * 도구를 손에 쥔 것처럼 보이게 SVG를 `cursor`에 직접 물린다.
 * 촉이 **좌측 상단**을 향해야 화살표 커서처럼 읽히므로 -45°로 눕히고, hotspot(실제로 찍히는 지점)을
 * 그 촉 끝에 맞춘다. 128×128을 넘기면 브라우저가 커서를 통째로 무시한다.
 *
 * 색·좌표에 쓰는 `#`은 data URI에서 조각 구분자라 그대로 두면 거기서 잘린다.
 * 다만 미리 `%23`으로 적어 두면 `encodeURIComponent`가 `%`를 다시 인코딩해 망가지므로,
 * **여기서는 `#`을 날것으로 쓰고 인코딩은 마지막에 한 번만** 한다.
 */

/** 커서 한 변의 픽셀 수. */
const SIZE = 56

/** 도구를 그리는 기준점(회전 중심). */
const CENTER = SIZE / 2

/**
 * 눕힌 도구의 촉이 놓이는 자리 = 실제로 찍히는 지점.
 * 뭉툭한 도구는 촉 한가운데보다 모서리가 더 바깥으로 나오므로, 그 모서리가 잘리지 않을 만큼 띄운다.
 */
const HOTSPOT = 8

/**
 * 촉이 위를 향하게 그린 도구를 좌측 상단으로 눕힌다.
 * 도구마다 촉이 중심에서 떨어진 거리가 달라, 눕히고 나면 촉이 놓이는 자리도 달라진다.
 * 그만큼 되밀어 어느 도구든 촉이 hotspot에 정확히 오게 한다.
 */
function tilt(tipY: number): string {
  const shift = CENTER - (CENTER - tipY) * Math.SQRT1_2 - HOTSPOT
  return `translate(${-shift.toFixed(2)},${-shift.toFixed(2)}) rotate(-45 ${CENTER} ${CENTER})`
}

/** 종이 위에서 형태가 뭉개지지 않도록 두르는 윤곽선. */
const OUTLINE = 'fill="none" stroke="#3a3a3a" stroke-opacity="0.45" stroke-width="1.2"'

function toCursor(body: string, tipY: number, fallback: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">` +
    `<g transform="${tilt(tipY)}">${body}</g>` +
    `</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${HOTSPOT} ${HOTSPOT}, ${fallback}`
}

/** 크레파스 겉모양. 연필과 달리 촉이 뾰족하지 않고 뭉툭하게 닳아 있다. */
const CRAYON_SILHOUETTE =
  'M24.5 9 Q28 4 31.5 9 L34.5 18 V48 a2 2 0 0 1 -2 2 H23.5 a2 2 0 0 1 -2 -2 V18 Z'

/** 종이 띠. 크레파스는 몸통을 종이로 감싸고 있고 그 위에 띠가 둘려 있다. */
const CRAYON_WRAPPER = 'M21.5 23 H34.5 V48 a2 2 0 0 1 -2 2 H23.5 a2 2 0 0 1 -2 -2 Z'

/** 지금 고른 색으로 칠한 크레파스 커서. */
export function crayonCursor(color: string): string {
  const body =
    `<path d="${CRAYON_SILHOUETTE}" fill="${color}"/>` +
    // 종이로 감싼 부분은 왁스가 드러난 촉보다 살짝 어둡게 깔아 구분한다.
    `<path d="${CRAYON_WRAPPER}" fill="#000" fill-opacity="0.16"/>` +
    `<rect x="21.5" y="27" width="13" height="1.8" fill="#fff" fill-opacity="0.55"/>` +
    `<rect x="21.5" y="32" width="13" height="1.8" fill="#fff" fill-opacity="0.55"/>` +
    `<path d="${CRAYON_SILHOUETTE}" ${OUTLINE}/>`
  return toCursor(body, 4, 'crosshair')
}

/** 지우개 커서. 크레파스 색과 무관하므로 색을 따라가지 않는다. */
export const ERASER_CURSOR = toCursor(
  `<rect x="20" y="13" width="16" height="30" rx="3.5" fill="#fdfaf7"/>` +
    // 손에 쥐는 슬리브가 대부분을 덮고, 닳는 머리만 위로 조금 나와 있다.
    `<path d="M20 24 h16 v15.5 a3.5 3.5 0 0 1 -3.5 3.5 h-9 a3.5 3.5 0 0 1 -3.5 -3.5 Z" fill="#8fb3cc"/>` +
    `<rect x="20" y="24" width="16" height="1.8" fill="#000" fill-opacity="0.12"/>` +
    `<rect x="20" y="13" width="16" height="30" rx="3.5" ${OUTLINE}/>`,
  13,
  'pointer',
)
