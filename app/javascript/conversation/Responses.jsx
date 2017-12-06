/**
 * @providesModule Responses
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { groupWith } from 'ramda'

import { StyledComment } from 'conversation/shared'
import Identicon from 'shared/Identicon'
import { SmallGreyText, ConversationTimestamp } from 'conversation/shared'

import type { Comment } from 'redux/state'

const ms = x => new Date(x).getTime()

const TWO_MINUTES = 2 * 60 * 1000 // milliseconds
const closeEnoughTimestamps = (a, b) => {
  return Math.abs(ms(a.timestamp) - ms(b.timestamp)) < TWO_MINUTES
}
const sameReader = (a, b) => a.reader.hashKey === b.reader.hashKey

const groupComments = comments =>
  groupWith(closeEnoughTimestamps, comments).map(groupWith(sameReader))

type Props = { responses: Comment[] }
const Responses = ({ responses }: Props) => {
  if (responses.length === 0) return null
  const timeGroups = groupComments(responses)
  return (
    <Container>
      {timeGroups.map(readerGroups => {
        const firstTimestamp = readerGroups[0][0].timestamp
        return [
          <Timestamp key={firstTimestamp}>
            <ConversationTimestamp value={firstTimestamp} />
          </Timestamp>,
          readerGroups.map(comments => (
            <ResponseGroup
              key={`${comments[0].reader.name} ${comments[0].timestamp}`}
            >
              <SmallGreyText>{comments[0].reader.name}</SmallGreyText>
              {comments.map(comment => (
                <Response key={comment.id}>
                  <StyledComment markdown={comment.content} />
                </Response>
              ))}
              <Identicon
                presentational
                key={comments[0].reader.hashKey}
                width={32}
                reader={comments[0].reader}
              />
            </ResponseGroup>
          )),
        ]
      })}
    </Container>
  )
}
export default Responses

const Container = styled.div``

const Timestamp = SmallGreyText.extend`
  display: block;
  width: 100%;
  text-align: center;
  margin-top: 36px;
`

const ResponseGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  margin: 10px 0 20px;

  &:last-child {
    margin-bottom: 0;
  }

  & ${SmallGreyText} {
    margin-left: 60px;
  }

  & .Identicon {
    position: absolute;
    bottom: 0;
  }
`

const Response = styled.blockquote`
  margin: 6px 0 0 44px;
  border: none;
  background-color: #d9d8d3;
  border-radius: 16px;
  max-width: 500px;
  padding: 7px 16px;
  line-height: 1.3;
`
