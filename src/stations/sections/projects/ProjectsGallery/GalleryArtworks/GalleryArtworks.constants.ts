/**
 * 액자 속 그림에 해당하는 메시. 칸 부품 하나에 한 장이라, 칸을 복제하면 그 수만큼 생긴다.
 * 앞면이 `M_Artwork` 재질의 평평한 판이고 그 앞에 사진 판을 세운다.
 */
export const GALLERY_ARTWORK_MESH = 'Panel_Artwork_Hit'

/** 프로젝트 사진이 든 폴더. 그 아래 **프로젝트 이름**으로 폴더가 하나씩 있다. */
export const GALLERY_ARTWORK_DIR = '/images/projects'

/** 프로젝트 폴더에서 액자에 거는 파일 이름. */
export const GALLERY_ARTWORK_FILE = 'cover.jpg'

/**
 * 사진 판을 액자 앞면에서 띄우는 거리(월드).
 * 앞면과 같은 평면에 두면 어느 쪽이 앞인지 정해지지 않아 얼룩진다.
 */
export const GALLERY_ARTWORK_LIFT = 0.006
