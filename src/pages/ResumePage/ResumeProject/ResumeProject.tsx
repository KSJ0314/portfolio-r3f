import {
  Column,
  Columns,
  Item,
  Link,
  List,
  ListItem,
  ListTitle,
  Name,
  Paragraph,
  Period,
  Summary,
  Tagline,
  Title,
} from './ResumeProject.styled'
import type { ResumeProjectProps } from './ResumeProject.types'

/**
 * 이력서의 프로젝트 항목 하나. 전시 칸 첫 장과 같은 구성이다.
 *
 * 제목 오른쪽에 기간, 그 아래 한 줄 소개와 요약, 주요 업무와 성과를 쌓는다.
 * 트러블슈팅은 넘치면 다음 장에서 이어지도록 조각마다 블록이라 여기 없다.
 * 이력서는 읽는 문서라 링크는 노션 주소 하나만 둔다.
 */
export function ResumeProject({ content }: ResumeProjectProps) {
  // 글에서 문단을 나누는 것은 빈 줄이다. 그리는 것은 문단마다 한 덩이씩이다.
  const paragraphs = content.summary.split(/\n\s*\n/)

  return (
    <Item>
      {content.links.notion && (
        <Link href={content.links.notion} target="_blank" rel="noreferrer">
          {content.links.notion}
        </Link>
      )}
      <Title>
        <Name>{content.title}</Name>
        <Period>{content.period}</Period>
      </Title>
      <Tagline>{content.tagline}</Tagline>
      <Summary>
        {paragraphs.map((text, index) => (
          <Paragraph key={index}>{text}</Paragraph>
        ))}
      </Summary>

      <Columns>
        <Column>
          <ListTitle>주요 업무</ListTitle>
          <List>
            {content.duties.map((line) => (
              <ListItem key={line}>{line}</ListItem>
            ))}
          </List>
        </Column>
        <Column>
          <ListTitle>성과</ListTitle>
          <List>
            {content.achievements.map((line) => (
              <ListItem key={line}>{line}</ListItem>
            ))}
          </List>
        </Column>
      </Columns>
    </Item>
  )
}
