import { Suspense, useEffect, useLayoutEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { useCollection } from '../../../../lib/firebase/hooks'
import { SceneArrival } from '../../../../scene/SceneArrival'
import { SceneErrorBoundary } from '../../../../scene/SceneErrorBoundary'
import { useInteriorStore } from '../../../../state/useInteriorStore'
import { BackButton } from '../../../../ui/BackButton'
import { GalleryPageHUD } from '../../../../ui/DevHUD/GalleryPageHUD'
import { InteriorCharacter, InteriorEnvironment, InteriorInput } from '../interior'
import { GalleryCameraRig } from './GalleryCameraRig'
import { GalleryModel } from './GalleryModel'
import { GalleryNameplates, type GalleryProject } from './GalleryNameplates'
import { GalleryTriggers } from './GalleryTriggers'
import {
  GALLERY_BACKGROUND,
  GALLERY_CAMERA_FAR,
  GALLERY_CAMERA_FOV,
  GALLERY_CAMERA_NEAR,
  GALLERY_CAMERA_OFFSET,
  GALLERY_ENV,
  GALLERY_EXPOSURE,
  GALLERY_FALLBACK_BAYS,
  GALLERY_FILL,
  GALLERY_START,
} from './ProjectsGallery.constants'
import { leaveGallery } from './ProjectsGallery.travel'

/** 시작 자리에 팔로우 오프셋을 더한 것이 첫 카메라 자리다 — 그래야 첫 프레임부터 자세가 맞다. */
const CAMERA_POSITION: [number, number, number] = [
  GALLERY_START[0] + GALLERY_CAMERA_OFFSET[0],
  GALLERY_CAMERA_OFFSET[1],
  GALLERY_START[1] + GALLERY_CAMERA_OFFSET[2],
]

/**
 * 전시 공간 페이지(`/projects/gallery`) — 로비 북쪽 통로 너머다.
 *
 * 로비와 **다른 라우트·다른 Canvas**다(DECISIONS 034와 같은 기준). 밟는 바닥도 막는 것도
 * 카메라 규칙도 로비와 다르고, 라우트를 나누면 이 모델이 로비 첫 로딩에 얹히지 않는다.
 * 이동은 실내 공통 부품이 맡아 조작감이 로비와 같다.
 *
 * **전시 칸 수는 Firestore `projects` 문서 개수다.** 데이터가 오기 전에는 방을 세우지 않아
 * 반쯤 지어진 방이 보이지 않는다 — 그동안 화면은 덮개가 덮고 있고, 도착도 알리지 않는다.
 */
export function ProjectsGalleryPage() {
  const { data: projects, loading } = useCollection<GalleryProject>('projects')

  // 칸을 세우는 순서이자 이름판에 적는 순서다. 로비 책의 목록과 같은 순서로 읽힌다.
  const titles = useMemo(
    () =>
      [...projects]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((project) => project.title),
    [projects],
  )

  // 읽기가 실패해도 방은 서야 한다 — 빈 방은 방이 아니다.
  const bays = Math.max(titles.length, GALLERY_FALLBACK_BAYS)

  // 들어올 때마다 문 안쪽에서 시작한다. 주소 직접 입력·앞으로가기로 들어오면 이동 상태가
  // 지난번 그대로다. 카메라 첫 자리도 시작 자리 기준이라 어긋나 있으면 화면이 튄다.
  useLayoutEffect(() => {
    useInteriorStore.getState().reset(GALLERY_START)
  }, [])

  // ESC는 좌상단 버튼과 같은 길을 탄다.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leaveGallery()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      {/* 로비와 같이 **원근** 카메라다. 실내는 깊이가 보여야 방으로 읽힌다. */}
      <Canvas
        camera={{
          position: CAMERA_POSITION,
          fov: GALLERY_CAMERA_FOV,
          near: GALLERY_CAMERA_NEAR,
          far: GALLERY_CAMERA_FAR,
        }}
        // 흰 대리석이 밝기 1을 넘겨 잘리면 빛 웅덩이의 계조가 사라진다. 노출로 화면 안에 들인다.
        gl={{ toneMappingExposure: GALLERY_EXPOSURE }}
        style={{ position: 'fixed', inset: 0 }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <color attach="background" args={[GALLERY_BACKGROUND]} />
        {/* 금속·광택이 보이게 하는 주역. 빛이 아니라 반사가 있어야 금속이 드러난다. */}
        <InteriorEnvironment blur={GALLERY_ENV.blur} intensity={GALLERY_ENV.intensity} />
        {/* 환경광이 못 채우는 몫을 메우는 전체 등. */}
        <hemisphereLight
          color={GALLERY_FILL.sky}
          groundColor={GALLERY_FILL.ground}
          intensity={GALLERY_FILL.intensity}
        />

        <SceneErrorBoundary>
          {/* 칸 수가 정해지기 전에는 세우지 않는다. 그동안 화면은 덮개가 덮고 있다. */}
          {!loading && (
            <Suspense fallback={null}>
              <GalleryModel bays={bays} />
              {/* 모델과 같은 경계에 둔다 — 준비된 뒤에야 세기 시작해야 덮개가 빈 방을 보이지 않는다. */}
              <SceneArrival />
            </Suspense>
          )}
          <InteriorCharacter />
          <GalleryCameraRig />
          <InteriorInput />
          {/* 누를 판과 이름판 글씨는 조립한 방에서 잰 자리에 서므로 모델이 준비된 뒤에 붙는다. */}
          <GalleryTriggers />
          <GalleryNameplates titles={titles} />
        </SceneErrorBoundary>
      </Canvas>
      {/* 전시실은 밝은 대리석이라 검정. */}
      <BackButton label="Back" color="#000000" onClick={leaveGallery} />

      {/* leva 튜닝 패널은 dev 전용이라 프로덕션 번들에서 빠진다. 라우트마다 하나씩 둔다. */}
      {import.meta.env.DEV && <GalleryPageHUD />}
    </>
  )
}
