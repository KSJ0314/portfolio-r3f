import type { ReactNode } from 'react'
import { ListTitle } from '../../ResumeProject.styled'
import {
  B,
  Bullet,
  Bullets,
  C,
  Heading,
  I,
  Label,
  Numbered,
  Numbers,
  Quote,
  Sub,
  Title,
  Trouble,
} from '../Troubles.styled'

/**
 * AIEMS 트러블슈팅. 노션 페이지의 구조와 표기를 그대로 옮긴다.
 *
 * 갈래마다 조각을 나눠 두면 분량이 A4를 넘길 때 그 갈래부터 다음 장에서 이어진다.
 */
export const TROUBLES_0: readonly ReactNode[] = [
  <Trouble>
    <ListTitle>트러블슈팅</ListTitle>
    <Title>“실시간 STT”</Title>
    <Quote>
      <I>
        “AI 고도화는 AI 담당 팀원이 하는것이고 내 역할은 완성된 AI를 모바일 기기에서 사용할 수 있게
        설정하는 것”
      </I>{' '}
      이라는 생각을 가지고 개발을 시작했습니다.
      <Sub>
        물론 AI 모델을 빌드하기 위한 설정도 할게 많고 모바일에서 사용하기 위한 변환 타입 설정등의
        작업도 많았지만 모델만 올린다고 끝나는 역할이 아니었습니다.
      </Sub>
      <Sub>
        <I>”Input(음성)을 넣으면 Output(텍스트)이 잘 나오겠지?”</I> 라는 생각과는 달리 녹음
        단계에서부터 음성 전처리, 배경 노이즈 제거, Token 설정, 토크나이저로 텍스트 변환 처리 등
        OnDevice AI 구현을 위해서는 많은 노력이 필요했습니다.
      </Sub>
      <Sub>
        여러 시행착오 끝에 STT가 실행은 됬습니다. 하지만, <I>”실행이 성공되면 속도를 줄여보자”</I>{' '}
        라는 계획과는 달리 최적화를 해도 실시간으로 사용하기에는 무리가 있었습니다.
      </Sub>
      <Sub>
        <I>”이렇게 생고생해서 구현했는데 지금와서 버려..?”</I>, <I>“되긴 하니까 그냥 쓸까?”</I> 라는
        유혹은 있었지만 사용자의 경험을 위해서는 실시간 변환을 포기할 수가 없었습니다.
      </Sub>
      <Sub>
        때문에 완전히 갈아 엎고 <B>Android SpeechRecognizer</B>를 채택하고 텍스트 후처리 로직을
        적용해 정확도 높은 실시간 STT를 구현할 수 있었습니다.
      </Sub>
      <Sub>AI를 무조건 가져다 적용하는 것이 아닌 목적에 맞게 모델이나 엔진을 채택하고</Sub>
      <Sub>
        AI의 추론과 직접 구현한 로직을 적용하는 것 중 더 나은 방법을 선택할 수 있는 능력을 기르는
        것이 AI 시대의 개발자가 갖춰야할 덕목이라고 생각합니다.
      </Sub>
    </Quote>
  </Trouble>,

  <Trouble>
    <Label>💡 문제 인식</Label>
    <Bullets>
      <Bullet>
        구급대원이 환자의 상태를 음성으로 입력하는 기능을 구현해야함. → 속도가 매우 중요!
      </Bullet>
      <Bullet>연속적으로 여러 필드를 발언할 때, UI의 실시간 변경이 필요</Bullet>
    </Bullets>
  </Trouble>,

  <Trouble>
    <Label>📝 해결 방안</Label>
    <Numbers>
      <Numbered>
        <B>Whisper </B>모델을 Tensorflow Lite로 변환하여 Ondevice로 구현
        <Sub>
          ⇒ tflite로 변환하는 과정에서 필수로 사용되야 할 연산자 버전(FULLY_CONNECTED v12) 문제로
          Kotlin 앱에서 사용에 문제가 생김
        </Sub>
        <Sub>
          ⇒ Huggingface에서 제공하는 onnx 모델로 빌드 테스트 성공하여{' '}
          <B>onnx로 변환하여 사용 결정</B>
        </Sub>
      </Numbered>
      <Numbered>
        프로젝트의 사용에 맞춰 학습한<B> Whisper onnx </B>모델로 Ondevice STT 구현
        <Sub>⇒ 변환 속도가 너무 느림</Sub>
        <Sub>
          ⇒ Tiny모델로 변경, 양자화 적용 모두 시도해 보았으나 단축한 시간도 1~2초 정도로 실시간
          변환에는 다소 사용감이 떨어짐
        </Sub>
      </Numbered>
      <Numbered>
        <B>Android SpeechRecognizer</B>의 부분 인식(Partial Result)을 사용해 STT 구현
        <Sub>⇒ 추가 학습 불가, 정확도가 낮음</Sub>
        <Sub>
          ❗ <B>사용자의 입력은 정해진 입력만 이루어짐 (나이는 xx, 성별은 xx 같이)</B>
        </Sub>
        <Sub>
          ⇒ 발음 사전을 자체적으로 구축해 텍스트 후처리를 통해 정확도를 보완 (<C>ex</C> ”호수”,
          “홉수”, “홉쓰” ⇒ “호흡수”)
        </Sub>
        <Sub>
          ⇒ <B>Trie 알고리즘</B>을 적용하여 사전 크기가 커져도 후처리 속도가 늘어나는 것을 방지
          (후처리 속도 2ms로 고정)
        </Sub>
      </Numbered>
    </Numbers>
  </Trouble>,

  <Trouble>
    <Label>📌 성과</Label>
    <Heading>정확도</Heading>
    <Bullets>
      <Bullet>단어당 100개 이상의 발음 교정 사전 구축</Bullet>
      <Bullet>
        사전에 단어만 추가한다면 사투리나 구어체도 변환 가능한 확장성을 가짐
        <Sub>(”배가 아파요” ⇒ “복통” 처럼 변환 가능하여 환자와 대화하면서도 사용 가능)</Sub>
      </Bullet>
    </Bullets>
    <Heading>속도</Heading>
    <Bullets>
      <Bullet>
        부분 인식(Partial Result)의 증분 처리를 적용해 100ms정도면 음성-텍스트 변환 가능
      </Bullet>
      <Bullet>Trie 알고리즘을 적용한 사전 검색을 적용하여 텍스트 후처리에 2ms면 충분</Bullet>
    </Bullets>
  </Trouble>,

  <Trouble>
    <Title>“디자인패턴”</Title>
    <Quote>
      프론트엔드 개발자는 사용자의 경험을 최우선으로 고려하며 개발해야한다. 라고 생각 해왔습니다.
      <Sub>
        물론, 그 생각이 바뀐건 아니지만 사용자의 경험만이 아닌 개발적인 면에서 코드의 품질과 체계적인
        구조 설계에 관심이 생겼습니다.
      </Sub>
      <Sub>이전 프로젝트들에서 FE 협업을 하면서 더욱 그 필요성을 느꼈습니다.</Sub>
      <Sub>
        <I>”어떻게 하면 각자 분담하여 협업하기 좋을까?”</I>
      </Sub>
      <Sub>
        <I>“내가 개발한 영역을 다른 팀원이 사용하기에도 좋게 만드려면 어떻게 해야할까?”</I>
      </Sub>
      <Sub>
        이런 생각으로 지인분들과 코치님들께 조언을 얻어 디자인패턴을 알아보고 Storybook도
        적용해보았습니다.
      </Sub>
      <Sub>
        FSD와 Atomic 디자인패턴을 섞어서 사용해 보았는데 학습 곡선도 높고 설계가 쉽지는 않았습니다.
      </Sub>
      <Sub>
        FE 리더로서 주제에 상관없이 구현이 가능한 부분들과 기본 구조 설계를 프로젝트 기획 단계에서
        먼저 학습하고 구축해서 협업 환경을 조성했습니다.
      </Sub>
      <Sub>
        디자인패턴을 학습하며 이해하고 팀원이 이해할 수 있게 정리하고 기본 설계까지 일주일가량 걸려
        많은 시간이 소요됬습니다.
      </Sub>
      <Sub>
        하지만, “프론트도 이렇게 체계적으로 관리가 되구나”라는 평가를 받을 만큼 팀원들의 반응도
        좋았고 기능별로 구분이 잘 되어 동시에 작업해도 충돌이 없었습니다.
      </Sub>
      <Sub>
        재사용성이 크게 증가하고 유지보수가 좋아 구현 시간은 이전보다 더 단축된 경험을 얻을 수
        있었습니다.
      </Sub>
    </Quote>
  </Trouble>,

  <Trouble>
    <Label>💡 문제 인식</Label>
    <Bullets>
      <Bullet>
        프로젝트가 커질수록 구조가 점점 복잡해지는 걸 직접 겪으면서, 지금 방식으로는 확장이나
        유지보수가 점점 힘들어질 것 같다는 문제를 인식함.
      </Bullet>
      <Bullet>
        Atomic 디자인 패턴을 적용해봤지만, 기능이 늘어나니까 오히려 구조가 복잡해지고 협업할 때 역할
        분리가 힘들어짐.
      </Bullet>
      <Bullet>
        기능 중심으로 깔끔하게 분리되고, 협업하기 용이한 구조가 필요하다고 생각하게 됨.
      </Bullet>
    </Bullets>
  </Trouble>,

  <Trouble>
    <Label>📝 해결 방안</Label>
    <Quote>FSD + Atomic</Quote>
    <Bullets>
      <Bullet>
        FSD 아키텍처를 적용해서 기능 단위로 구조를 확실하게 나누고, 책임 범위도 명확하게 가져가도록
        함.
      </Bullet>
      <Bullet>
        공통 UI 컴포넌트는 Atomic 디자인 패턴을 활용해 재사용성과 구성 요소의 일관성을 유지하도록 함.
      </Bullet>
    </Bullets>
  </Trouble>,

  <Trouble>
    <Label>📌 성과</Label>
    <Heading>장점</Heading>
    <Bullets>
      <Bullet>기능 단위로 구조가 정리돼서 신규 기능 추가할 때 기존 코드에 영향이 거의 없어짐</Bullet>
      <Bullet>파일 구조가 명확해져서 협업할 때 충돌이나 책임 범위 겹침이 크게 줄어듦</Bullet>
      <Bullet>UI는 Atomic으로 관리돼 컴포넌트 재사용률이 올라가고 스타일 일관성도 좋아짐</Bullet>
      <Bullet>
        전반적으로 유지보수 속도가 빨라지고, 기능별로 작업을 나누기 쉬워져 협업 효율이 향상됨
      </Bullet>
    </Bullets>
    <Heading>단점</Heading>
    <Bullets>
      <Bullet>
        학습 곡선이 높고 설계가 복잡해 설계 단계에만 3일이 소요됨.
        <Sub>
          ⇒ 본격적인 팀 개발 시작 전 FE 리더로서 미리 설계를 완료하고 TODO 기반 팀 작업을 진행
        </Sub>
        <Sub>
          ⇒ 설계 단계에서 개발한 기본 핵심 구조와 프로젝트의 필수 요소들 (Atom 레벨 컴포넌트, Theme,
          Axios 설정 등)을 Skeleton Code로 추후에 재활용 가능할 것으로 예상됨
        </Sub>
      </Bullet>
    </Bullets>
    <Heading>결과</Heading>
    <Quote>
      설계 단계는 복잡할 수 있으나 구현 단계에서 개발 속도가 향상되어 규모가 큰 프로젝트일 수록 유지
      보수가 향상될 것으로 보임
    </Quote>
  </Trouble>,
]
