export interface LoadFailedProps {
  /** 글자 크기. 그 자리에 오려던 내용에 맞춰 쓰는 쪽이 정한다. 아이콘 크기도 여기서 나온다. */
  size: number
  /** 놓을 자리(눕힌 그룹 안의 화면 좌표). 주지 않으면 그 그룹의 가운데다. */
  x?: number
  y?: number
  /** 다시 읽기. 훅이 돌려주는 `refetch`를 그대로 넘긴다. */
  onRetry: () => void
}
