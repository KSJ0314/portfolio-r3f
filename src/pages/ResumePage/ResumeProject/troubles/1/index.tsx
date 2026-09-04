import type { ReactNode } from 'react'
import { ListTitle } from '../../ResumeProject.styled'
import { B, Bullet, Bullets, C, I, Label, Numbered, Numbers, Quote, Sub, Title, Trouble } from '../Troubles.styled'

/**
 * NEWSPeaking 트러블슈팅. 노션 페이지의 구조와 표기를 그대로 옮긴다.
 *
 * 갈래마다 조각을 나눠 두면 분량이 A4를 넘길 때 그 갈래부터 다음 장에서 이어진다.
 */
export const TROUBLES_1: readonly ReactNode[] = [
  <Trouble>
    <ListTitle>트러블슈팅</ListTitle>
    <Title>“대용량 처리 도구의 도입 기준”</Title>
    <Quote>
      이 프로젝트는 “빅데이터”를 핵심으로 내세운 프로젝트였지만, 실제로 다뤄야 할 뉴스 데이터는 분산
      처리가 없으면 못 다룰 정도의 규모는 아니었습니다.
      <Sub>
        파이프라인이 도는 시점도 서비스 시작 전 단어 데이터베이스를 구축하는 첫 단계뿐이라, 처리
        속도가 사용자 경험에 직접 닿지도 않았습니다.
      </Sub>
      <Sub>
        <I>“이 정도면 그냥 스크립트로 돌려도 되는 것 아닌가?”</I>
      </Sub>
      <Sub>
        주제에 맞추려고 도구를 억지로 끼워 넣는 것은 아닌지 오래 고민했고, 컨설턴트님과도 여러 차례
        상담했습니다.
      </Sub>
      <Sub>
        결론은{' '}
        <B>
          판단 기준을 “지금 이걸 쓸 만큼 큰가”에서 “이 흐름이 앞으로 몇 번 더 돌 것인가”로 옮기는 것
        </B>
        이었습니다.
      </Sub>
      <Sub>
        영어만 지원하는 지금은 한 번 돌면 끝이지만, 다른 언어를 지원하게 되면 같은 흐름을 언어
        수만큼 다시 돌려야 합니다. 그때 파이프라인이 없다면 그 수만큼 수집·처리 코드를 새로 짜게
        됩니다.
      </Sub>
      <Sub>
        지금 당장의 이득만 따지면 과하지 않나라는 의문이 들 수 있습니다. 무엇이 반복될 것인지를 함께
        봐야 판단이 선다는 것을 배웠습니다.
      </Sub>
    </Quote>
  </Trouble>,

  <Trouble>
    <Label>💡 문제 인식</Label>
    <Bullets>
      <Bullet>
        프리토킹 주제와 연관 단어 판단의 재료가 될 단어 데이터베이스를 먼저 구축해야 함. 처리 대상은
        뉴스 <B>150만 건</B>
      </Bullet>
      <Bullet>
        이 정도 규모는 분산 처리 없이도 처리할 수 있고, 서비스 시작 전 한 번 도는 배치라 속도가
        사용자 경험에 닿지 않음
      </Bullet>
      <Bullet>
        <B>“주제가 빅데이터니까 쓴다”가 도입 근거가 될 수 있는지</B>가 실제 고민
      </Bullet>
    </Bullets>
  </Trouble>,

  <Trouble>
    <Label>📝 해결 방안</Label>
    <Quote>
      지금의 이득이 아니라 <B>앞으로 몇 번 더 도는가</B>를 기준으로 판단
    </Quote>
    <Numbers>
      <Numbered>
        <B>파이프라인으로 구축해 재사용 가능하게 둠</B>
        <Sub>
          지원 언어가 늘 때마다 같은 흐름을 다시 돌려야 하고, 그때 파이프라인이 없으면 수집·처리
          코드를 매번 새로 짜게 됨
        </Sub>
        <Sub>⇒ 수집 부분만 갈아 끼우면 언어나 뉴스 출처가 바뀌어도 그대로 재사용</Sub>
      </Numbered>
      <Numbered>
        <B>전송에 Kafka 도입</B>
        <Sub>대용량을 한 번에 옮기면 중간에 끊길 때 전송분이 전부 날아감</Sub>
        <Sub>
          ⇒ Kafka가 메시지를 보관하므로 끊긴 지점부터 이어서 처리. 수집과 처리를 각자의 속도로 돌릴
          수 있음
        </Sub>
      </Numbered>
      <Numbered>
        <B>Producer를 멀티프로세스로 구성</B>
        <Sub>
          ⇒ 8개 워커 병렬 전송, 1MB 배치·zstd 압축 적용해 <B>초당 5만 건</B> 전송
        </Sub>
      </Numbered>
      <Numbered>
        <B>용도에 따라 토픽을 나눔</B>
        <Sub>
          ⇒ 전처리용 <C>control-topic</C>은 파티션 3개로 병렬 소비, 키워드용 <C>keyword-topic</C>은
          파티션 1개로 순차 처리 보장
        </Sub>
      </Numbered>
      <Numbered>
        <B>Spark Structured Streaming의 마이크로 배치로 소비</B>
        <Sub>
          ⇒ <B>50,000건 / 10초</B> 단위로 끊어 메모리 부담을 줄이고, 체크포인트 오프셋 관리로 중복
          처리 방지
        </Sub>
      </Numbered>
    </Numbers>
  </Trouble>,

  <Trouble>
    <Label>📌 성과</Label>
    <Bullets>
      <Bullet>뉴스 150만 건을 처리해 단어 데이터베이스 구축 완료</Bullet>
      <Bullet>언어나 뉴스 출처가 바뀌어도 수집 부분만 갈아 끼우면 그대로 재사용 가능</Bullet>
      <Bullet>전송이 중간에 끊겨도 처음부터 다시 하지 않음</Bullet>
      <Bullet>
        수집·전송·처리를 각각 다른 서버로 분리해 한쪽 부하가 다른 쪽에 영향을 주지 않음
      </Bullet>
    </Bullets>
  </Trouble>,
]
