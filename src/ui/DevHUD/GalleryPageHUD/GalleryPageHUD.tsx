import { useEffect } from 'react'
import { button, folder, useControls } from 'leva'
import { useGalleryPageStore } from '../../../state/useGalleryPageStore'
import { INTRO_PAGE_LAYOUT } from '../../../stations/sections/projects/contents/shared/IntroPage'
import { GALLERY_PAGER } from '../../../stations/sections/projects/ProjectsGallery/GalleryPages/GalleryPager'
import {
  GALLERY_CAMERA_ANCHOR,
  GALLERY_CAMERA_FOV,
  GALLERY_CAMERA_OFFSET,
  GALLERY_CAMERA_SHIFT,
} from '../../../stations/sections/projects/ProjectsGallery/ProjectsGallery.constants'
import { DevPanel } from '../DevPanel'

const A = GALLERY_CAMERA_ANCHOR
const O = GALLERY_CAMERA_OFFSET
const F = GALLERY_CAMERA_FOV
const S = GALLERY_CAMERA_SHIFT
const P = GALLERY_PAGER
const I = INTRO_PAGE_LAYOUT

/** 툴팁 문구 — 설명 뒤에 기본값을 붙인다. */
function hint(description: string, value: number | string) {
  return `${description}\n기본값: ${value}`
}

/**
 * 전시 공간을 마우스로 조절하는 개발용 HUD(dev에서만 렌더된다).
 *
 * 로비와 라우트가 달라 그쪽 HUD가 마운트되지 않는다. 그래서 패널(`DevPanel`)도 여기서 함께 그린다.
 *
 * 값이 정해지면 "값 복사"로 얻은 JSON을 `ProjectsGallery.constants.ts`의 기본값에 반영해 확정한다.
 */
export function GalleryPageHUD() {
  const setCamera = useGalleryPageStore((s) => s.setCamera)
  const setPager = useGalleryPageStore((s) => s.setPager)
  const setIntroPage = useGalleryPageStore((s) => s.setIntroPage)
  const setShowColliders = useGalleryPageStore((s) => s.setShowColliders)

  // 되돌리기 버튼이 패널의 값 자체를 되돌려야 하므로 함수 형태로 정의해 set을 받는다.
  const [values, set] = useControls('전시 공간', () => ({
    '카메라': folder(
      {
        anchorY: {
          value: A.y,
          min: 0,
          max: 8,
          step: 0.1,
          label: '보는 높이',
          hint: hint('바라보는 점의 높이. 벽에 걸린 작품 쪽에 못 박는다.', A.y),
        },
        anchorZ: {
          value: A.z,
          min: -2,
          max: 4,
          step: 0.1,
          label: '보는 깊이',
          hint: hint('바라보는 점의 깊이. 벽(0)과 열린 면(3) 사이 어디를 볼지.', A.z),
        },
        cameraX: {
          value: O[0],
          min: -20,
          max: 20,
          step: 0.1,
          label: '오프셋 x',
          hint: hint('옆으로 비켜선 정도. 0이면 벽을 정면으로 본다.', O[0]),
        },
        cameraY: {
          value: O[1],
          min: -10,
          max: 20,
          step: 0.1,
          label: '오프셋 y',
          hint: hint('카메라 높이. z와의 비가 곧 내려다보는 각도다.', O[1]),
        },
        cameraZ: {
          value: O[2],
          min: 0.5,
          max: 40,
          step: 0.1,
          label: '오프셋 z',
          hint: hint('뒤로 물러난 거리. 원근 카메라라 멀어질수록 작게 보인다.', O[2]),
        },
        cameraFov: {
          value: F,
          min: 15,
          max: 90,
          step: 1,
          label: '화각',
          hint: hint('세로 화각(도). 넓힐수록 한 화면에 담기는 칸이 늘어난다.', F),
        },
      },
      { collapsed: true },
    ),
    '구도': folder(
      {
        shiftX: {
          value: S.x,
          min: -1,
          max: 1,
          step: 0.01,
          label: '가로',
          hint: hint('0이면 보는 점이 화면 한가운데. 양수면 오른쪽으로 간다.', S.x),
        },
        shiftY: {
          value: S.y,
          min: -1,
          max: 1,
          step: 0.01,
          label: '세로',
          hint: hint('0이면 보는 점이 화면 한가운데. 음수면 아래로 내려간다.', S.y),
        },
      },
      { collapsed: true },
    ),
    '페이지 넘김': folder(
      {
        dotRadius: {
          value: P.dotRadius,
          min: 0.001,
          max: 0.02,
          step: 0.0005,
          label: '점 크기',
          hint: hint('점 반지름. 액자 가로 1을 기준으로 한 비율이다.', P.dotRadius),
        },
        dotGap: {
          value: P.dotGap,
          min: 0.004,
          max: 0.06,
          step: 0.001,
          label: '점 간격',
          hint: hint(
            '점 중심에서 다음 점 중심까지. 누르는 판은 이 간격의 절반을 넘지 않는다.',
            P.dotGap,
          ),
        },
        dotBottom: {
          value: P.dotBottom,
          min: 0,
          max: 0.1,
          step: 0.002,
          label: '점 아래 여백',
          hint: hint('점을 페이지 아래 끝에서 올리는 거리.', P.dotBottom),
        },
        arrowSize: {
          value: P.arrowSize,
          min: 0.005,
          max: 0.08,
          step: 0.002,
          label: '꺾쇠 크기',
          hint: hint('꺾쇠 전체 세로.', P.arrowSize),
        },
        arrowInset: {
          value: P.arrowInset,
          min: 0,
          max: 0.1,
          step: 0.002,
          label: '꺾쇠 좌우 여백',
          hint: hint('꺾쇠를 페이지 좌우 끝에서 들이는 거리.', P.arrowInset),
        },
      },
      { collapsed: true },
    ),
    '첫 장': folder(
      {
        padX: {
          value: I.padX,
          min: 0,
          max: 0.2,
          step: 0.002,
          label: '좌우 여백',
          hint: hint('판 좌우 끝에서 내용까지. 액자 가로 1을 기준으로 한 비율이다.', I.padX),
        },
        padY: {
          value: I.padY,
          min: 0,
          max: 0.2,
          step: 0.002,
          label: '상하 여백',
          hint: hint('판 위아래 끝에서 내용까지.', I.padY),
        },
        titleSize: {
          value: I.titleSize,
          min: 0.02,
          max: 0.12,
          step: 0.002,
          label: '제목 크기',
          hint: hint('맨 위 프로젝트 이름.', I.titleSize),
        },
        titleGap: {
          value: I.titleGap,
          min: 0,
          max: 0.1,
          step: 0.002,
          label: '제목 아래 간격',
          hint: hint('제목과 한 줄 소개 사이.', I.titleGap),
        },
        taglineSize: {
          value: I.taglineSize,
          min: 0.008,
          max: 0.06,
          step: 0.001,
          label: '한 줄 소개 크기',
          hint: hint('제목 아래 한 줄.', I.taglineSize),
        },
        taglineGap: {
          value: I.taglineGap,
          min: 0,
          max: 0.12,
          step: 0.002,
          label: '한 줄 소개 아래 간격',
          hint: hint('한 줄 소개와 요약 사이.', I.taglineGap),
        },
        summarySize: {
          value: I.summarySize,
          min: 0.008,
          max: 0.04,
          step: 0.001,
          label: '요약 크기',
          hint: hint('요약 본문.', I.summarySize),
        },
        summaryLineHeight: {
          value: I.summaryLineHeight,
          min: 1,
          max: 2.6,
          step: 0.05,
          label: '요약 줄 간격',
          hint: hint('글자 크기에 대한 배수.', I.summaryLineHeight),
        },
        quoteWidth: {
          value: I.quoteWidth,
          min: 0.001,
          max: 0.02,
          step: 0.001,
          label: '인용 막대 폭',
          hint: hint('요약 왼쪽 세로 막대.', I.quoteWidth),
        },
        quoteGap: {
          value: I.quoteGap,
          min: 0,
          max: 0.08,
          step: 0.002,
          label: '인용 막대 거리',
          hint: hint('막대에서 요약 글까지.', I.quoteGap),
        },
        summaryGap: {
          value: I.summaryGap,
          min: 0,
          max: 0.15,
          step: 0.002,
          label: '요약 아래 간격',
          hint: hint('요약과 성과 사이.', I.summaryGap),
        },
        bulletRadius: {
          value: I.bulletRadius,
          min: 0.001,
          max: 0.015,
          step: 0.0005,
          label: '성과 점 크기',
          hint: hint('성과 줄 앞에 찍는 점의 반지름.', I.bulletRadius),
        },
        bulletGap: {
          value: I.bulletGap,
          min: 0,
          max: 0.06,
          step: 0.002,
          label: '성과 점 거리',
          hint: hint('점에서 글까지.', I.bulletGap),
        },
        trophySize: {
          value: I.trophySize,
          min: 0.008,
          max: 0.06,
          step: 0.001,
          label: '트로피 크기',
          hint: hint('성과 첫 줄 앞 아이콘.', I.trophySize),
        },
        trophyGap: {
          value: I.trophyGap,
          min: 0,
          max: 0.06,
          step: 0.002,
          label: '트로피 거리',
          hint: hint('트로피에서 첫 줄 글까지.', I.trophyGap),
        },
        achievementSize: {
          value: I.achievementSize,
          min: 0.008,
          max: 0.04,
          step: 0.001,
          label: '성과 목록 크기',
          hint: hint('요약 아래로 쌓이는 성과들.', I.achievementSize),
        },
        achievementGap: {
          value: I.achievementGap,
          min: 0,
          max: 0.06,
          step: 0.001,
          label: '성과 목록 줄 간격',
          hint: hint('성과 목록의 줄 사이.', I.achievementGap),
        },
        periodSize: {
          value: I.periodSize,
          min: 0.008,
          max: 0.04,
          step: 0.001,
          label: '기간 크기',
          hint: hint('제목 오른쪽 기간·팀 한 줄.', I.periodSize),
        },
        periodGap: {
          value: I.periodGap,
          min: 0,
          max: 0.1,
          step: 0.002,
          label: '기간 거리',
          hint: hint('제목 오른쪽 끝에서 기간까지.', I.periodGap),
        },
        iconSize: {
          value: I.iconSize,
          min: 0.01,
          max: 0.09,
          step: 0.002,
          label: '링크 아이콘 크기',
          hint: hint('우상단 GitHub·노션 아이콘.', I.iconSize),
        },
        iconGap: {
          value: I.iconGap,
          min: 0.01,
          max: 0.15,
          step: 0.002,
          label: '링크 아이콘 간격',
          hint: hint('아이콘 중심에서 다음 아이콘 중심까지.', I.iconGap),
        },
      },
      { collapsed: true },
    ),
    '판정': folder(
      {
        showColliders: {
          value: false,
          label: '콜라이더 보기',
          hint: '판정에 쓰는 콜라이더를 그대로 그린다.\n초록 바닥 · 빨강 막는 것 · 파랑 머리 위 · 노랑 트리거 · 회색 안 쓰임',
        },
      },
      { collapsed: true },
    ),
  }))

  // 버튼은 따로 등록한다. 위 스키마 안에서는 아직 set이 선언되기 전이라 참조할 수 없다.
  useControls(
    '전시 공간',
    {
      '값 복사(JSON)': button(() => {
        const { camera } = useGalleryPageStore.getState()
        const json = JSON.stringify(
          {
            anchor: { y: camera.anchorY, z: camera.anchorZ },
            offset: [camera.x, camera.y, camera.z],
            fov: camera.fov,
            shift: { x: camera.shiftX, y: camera.shiftY },
            pager: useGalleryPageStore.getState().pager,
            introPage: useGalleryPageStore.getState().introPage,
          },
          null,
          2,
        )
        void navigator.clipboard?.writeText(json)
        console.log(json)
      }),
      '기본값으로': button(() =>
        set({
          anchorY: A.y,
          anchorZ: A.z,
          cameraX: O[0],
          cameraY: O[1],
          cameraZ: O[2],
          cameraFov: F,
          shiftX: S.x,
          shiftY: S.y,
          dotRadius: P.dotRadius,
          dotGap: P.dotGap,
          dotBottom: P.dotBottom,
          arrowSize: P.arrowSize,
          arrowInset: P.arrowInset,
        }),
      ),
    },
    [set],
  )

  useEffect(() => {
    setCamera({
      anchorY: values.anchorY,
      anchorZ: values.anchorZ,
      x: values.cameraX,
      y: values.cameraY,
      z: values.cameraZ,
      fov: values.cameraFov,
      shiftX: values.shiftX,
      shiftY: values.shiftY,
    })
  }, [values, setCamera])

  useEffect(() => {
    setPager({
      dotRadius: values.dotRadius,
      dotGap: values.dotGap,
      dotBottom: values.dotBottom,
      arrowSize: values.arrowSize,
      arrowInset: values.arrowInset,
    })
  }, [values, setPager])

  useEffect(() => {
    setIntroPage({
      padX: values.padX,
      padY: values.padY,
      titleSize: values.titleSize,
      titleGap: values.titleGap,
      taglineSize: values.taglineSize,
      taglineGap: values.taglineGap,
      summarySize: values.summarySize,
      summaryLineHeight: values.summaryLineHeight,
      quoteWidth: values.quoteWidth,
      quoteGap: values.quoteGap,
      summaryGap: values.summaryGap,
      bulletRadius: values.bulletRadius,
      bulletGap: values.bulletGap,
      trophySize: values.trophySize,
      trophyGap: values.trophyGap,
      achievementSize: values.achievementSize,
      achievementGap: values.achievementGap,
      periodSize: values.periodSize,
      periodGap: values.periodGap,
      iconSize: values.iconSize,
      iconGap: values.iconGap,
    })
  }, [values, setIntroPage])

  useEffect(() => {
    setShowColliders(values.showColliders)
  }, [values.showColliders, setShowColliders])

  return <DevPanel />
}
