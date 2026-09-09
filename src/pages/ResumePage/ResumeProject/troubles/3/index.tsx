import type { ReactNode } from 'react'
import { ListTitle } from '../../ResumeProject.styled'
import { B, Bullet, Bullets, Label, Numbered, Numbers, Quote, Sub, Title, Trouble } from '../Troubles.styled'

/**
 * SSAFY COFFEE 트러블슈팅. 노션 페이지의 구조와 표기를 그대로 옮긴다.
 *
 * 갈래마다 조각을 나눠 두면 분량이 A4를 넘길 때 그 갈래부터 다음 장에서 이어진다.
 */
export const TROUBLES_3: readonly ReactNode[] = [
  <Trouble>
    <ListTitle>트러블슈팅</ListTitle>
    <Title>“AI로 서비스를 만들어 본 경험”</Title>
    <Quote>
      이전 프로젝트들은 제가 코드를 짜고 AI는 막히는 부분을 물어보는 정도로 썼습니다.
      <Sub>
        이번에는 방식을 바꿔{' '}
        <B>직접 코드를 작성하지 않고 Claude Code로만 만들어 서비스를 진행 했습니다.</B>
      </Sub>
      <Sub>
        코드를 직접 작성하는 대신 무엇을 만들지 정하고, 나온 걸 읽고 판단하는 데 시간을 투자
        했습니다.
      </Sub>
      <Sub>
        코치 업무가 본업이기 때문에 남는 시간에 틈틈히 진행한 프로젝트였는데도, 두 달 만에 웹과
        데스크탑 앱을 함께 올리고 v1.10.0까지 운영할 수 있었습니다.
      </Sub>
      <Sub>
        다만 시키는 대로 계속 쌓다 보면 같은 코드가 여기저기 생기고 파일이 뒤엉키기도 해서, 중간에
        구조를 정리하는 작업이 따로 필요하기도 하였습니다.
      </Sub>
      <Sub>
        ’그래도 사람이 직접 만드는게 낫지’ 라는 생각에서 벗어나 AI를 활용해 생산성을 극대화하는
        경험을 가질 수 있었습니다.
      </Sub>
    </Quote>
  </Trouble>,

  <Trouble>
    <Label>💡 배경</Label>
    <Bullets>
      <Bullet>이전까지는 코드를 직접 작성하고 AI는 보조로만 사용</Bullet>
      <Bullet>
        코치 업무가 본업이라 남는 시간에 만든 프로젝트. 개발 방식 자체를 새로 시험해 보기 좋은
        조건이었음
      </Bullet>
      <Bullet>
        목표는 “AI가 어디까지 되나”가 아니라{' '}
        <B>AI를 주로 사용해 실제로 쓰이는 서비스를 끝까지 만들어 운영하는 것</B>
      </Bullet>
    </Bullets>
  </Trouble>,

  <Trouble>
    <Label>📝 진행 방식</Label>
    <Numbers>
      <Numbered>
        <B>뭔 만들지 먼저 정해서 넘김</B>
        <Sub>⇒ 화면 구성과 동작을 구체적으로 적어 전달할수록 다시 손볼 일이 줄어드음</Sub>
      </Numbered>
      <Numbered>
        <B>나온 결과를 읽고 판단하는 데 시간을 투자</B>
        <Sub>⇒ 의도와 맞는지, 구조가 어긋나지 않는지 확인하는 것이 주된 작업이 됨</Sub>
      </Numbered>
      <Numbered>
        <B>구조 정리를 따로 함</B>
        <Sub>
          ⇒ 기능을 쌓다 보면 중복과 뒤엉킴이 생겨, 의존성과 폴더 구조를 정리하는 작업을 별도로 진행
        </Sub>
      </Numbered>
    </Numbers>
  </Trouble>,

  <Trouble>
    <Label>📌 결과</Label>
    <Bullets>
      <Bullet>
        본업과 병행하면서 두 달 만에 웹과 데스크탑 앱을 만들어 배포하고 v1.10.0까지 운영
      </Bullet>
      <Bullet>
        코드 작성보다 <B>뭔 만들지 정하고 나온 걸 판단하는 일</B>에 시간을 쓰는 방식을 경험
      </Bullet>
      <Bullet>
        AI는 당장의 결과물을 만드는 것에는 탁월함. 하지만 유지보수와 재사용성을 고려하는 능력은 약함.
        <Sub>
          탄탄한 구조를 만들어 가기 위해서는 AI를 사용하는 개발자의 역량이 중요하다는 것을 느낌.
        </Sub>
      </Bullet>
    </Bullets>
  </Trouble>,
]
