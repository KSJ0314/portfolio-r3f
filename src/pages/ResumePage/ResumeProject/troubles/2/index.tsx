import type { ReactNode } from 'react'
import { ListTitle } from '../../ResumeProject.styled'
import { B, Bullet, Bullets, C, I, Label, Numbered, Numbers, Quote, Sub, Title, Trouble } from '../Troubles.styled'

/**
 * 캐릭캐릭스터디 트러블슈팅. 노션 페이지의 구조와 표기를 그대로 옮긴다.
 *
 * 갈래마다 조각을 나눠 두면 분량이 A4를 넘길 때 그 갈래부터 다음 장에서 이어진다.
 */
export const TROUBLES_2: readonly ReactNode[] = [
  <Trouble>
    <ListTitle>트러블슈팅</ListTitle>
    <Title>“컴포넌트 구조 설계와 Atomic 디자인 패턴”</Title>
    <Quote>
      이전 프로젝트까지는 프론트엔드 구조를 따로 고민하지 않고 화면 단위로 폴더를 나누는 기본 구조만
      썼습니다.
      <Sub>그런데 이번에는 6인 규모 팀 프로젝트였고 저는 메인 FE였습니다.</Sub>
      <Sub>
        화면이 스터디 · 캐릭터 · 거래소 · 챌린지 · 소셜까지 많았고, 같은 버튼과 입력창이 화면마다
        반복해서 나올 구조였습니다.
      </Sub>
      <Sub>
        <I>“내가 만든 것을 다른 팀원이 그대로 가져다 쓰려면 어떻게 나눠 두어야 할까?”</I>
      </Sub>
      <Sub>
        협업과 재사용을 높이는 방법을 찾아보다가 Atomic 디자인 패턴을 알게 됐고, 화면을 짜기 전에
        도입했습니다.
      </Sub>
      <Sub>
        최소 단위부터 조합해 올리는 구조라 공통 요소를 먼저 만들어 두면 그 위는 조합으로 만들어갈 수
        있었습니다.
      </Sub>
      <Sub>
        실제로 화면이 늘어나도 버튼이나 입력창을 다시 만들 일이 없었고, 팀원이 새 화면을 맡아도 이미
        있는 컴포넌트를 가져다 쓰면 됐습니다.
      </Sub>
    </Quote>
  </Trouble>,

  <Trouble>
    <Label>💡 문제 인식</Label>
    <Bullets>
      <Bullet>
        이전까지는 화면 단위로 폴더만 나누는 기본 구조를 썼음. 혼자 하거나 규모가 작을 때는 문제가
        없었음
      </Bullet>
      <Bullet>
        6인 규모 팀 프로젝트가 처음이라, 메인 FE로서 팀이 함께 쓸 기반을 먼저 마련해야 한다고 판단
      </Bullet>
      <Bullet>
        스터디·캐릭터·거래소·챌린지·소셜까지 화면이 많아 같은 요소가 반복해서 나올 구조
      </Bullet>
      <Bullet>
        화면을 만들면서 구조를 잡으면 이미 늦고, 나중에 스타일을 바꿀 때 화면을 전부 찾아다녀야 함
      </Bullet>
    </Bullets>
  </Trouble>,

  <Trouble>
    <Label>📝 해결 방안</Label>
    <Numbers>
      <Numbered>
        <B>협업과 재사용을 높일 구조를 찾아보고 Atomic 디자인 패턴 채택</B>
        <Sub>
          ⇒ <C>atoms</C> · <C>molecules</C> · <C>organisms</C> · <C>templates</C> · <C>pages</C>{' '}
          5단계로 나눠 최소 단위부터 조합해 올리는 구조
        </Sub>
      </Numbered>
      <Numbered>
        <B>화면 구현 전에 구조부터 세움</B>
        <Sub>
          ⇒ 폴더가 곧 규칙이라 새 컴포넌트를 어디에 둘지 따로 정하지 않아도 자리가 정해짐
        </Sub>
      </Numbered>
      <Numbered>
        <B>공통 요소를 최소 단위로 먼저 만들어 둠</B>
        <Sub>⇒ 버튼·입력창·아이콘을 먼저 만들어 두고 그 위를 조합해 올림</Sub>
      </Numbered>
    </Numbers>
  </Trouble>,

  <Trouble>
    <Label>📌 성과</Label>
    <Bullets>
      <Bullet>화면이 늘어도 같은 UI가 다시 만들어지지 않아 스타일이 흐트러지지 않음</Bullet>
      <Bullet>최소 단위가 먼저 있어 새 화면을 만들 때 조합만 하면 됨</Bullet>
      <Bullet>스타일을 바꿀 때 최소 단위 하나만 고치면 전 화면에 반영됨</Bullet>
    </Bullets>
  </Trouble>,

  <Trouble>
    <Label>🔄 남은 불편함과 다음 프로젝트에서의 개선</Label>
    <Quote>
      Atomic으로 나누는 것까지는 잘 됐지만, 쓰면서 다른 불편함이 드러났습니다.
      <Sub>
        팀원이 이미 만들어진 컴포넌트를 재사용하려 해도 <B>그게 어떻게 생겼는지 확인할 방법이
        없었습니다.</B> 화면에 직접 붙여 띄워 봐야 알 수 있었고, 어떤 props를 넘겨야 하는지는 구현
        파일을 열어 읽어야 했습니다.
      </Sub>
      <Sub>
        컴포넌트가 적을 때는 물어보면 됐지만,{' '}
        <B>화면이 늘고 컴포넌트가 쌓일수록 재사용하려다 오히려 시간이 더 걸렸습니다.</B> 재사용하려고
        나눈 구조인데 재사용의 문턱이 생긴 셈입니다.
      </Sub>
      <Sub>
        <B>분류가 다섯 층뿐이라 규모가 커지자 한 폴더에 수십 개가 평평하게 쌓였습니다.</B> 기능이
        달라도 같은 층이면 한자리에 섞여 찾기 어려웠습니다.
      </Sub>
    </Quote>
    <Bullets>
      <Bullet>이 불편함들을 다음 프로젝트(AIEMS)에서 세 가지로 풀었습니다.</Bullet>
    </Bullets>
    <Numbers>
      <Numbered>
        <B>FSD + Atomic 조합</B> — 기능 단위는 FSD로 나누고 공통 UI에만 Atomic을 적용. 층 하나에
        몰리던 것이 기능별로 갈라져 찾는 범위가 좁아짐
      </Numbered>
      <Numbered>
        <B>Storybook 도입과 별도 배포</B> — 컴포넌트를 화면에 붙여 보지 않아도 브라우저에서 실물과
        props를 바로 확인
      </Numbered>
      <Numbered>
        <B>TypeScript 적용</B> — props를 타입으로 강제해 잘못 넘기면 코드를 읽기 전에 드러나게 함
      </Numbered>
    </Numbers>
  </Trouble>,
]
