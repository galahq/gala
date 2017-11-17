/**
 * @providesModule SelectedCommentThread
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { InputGroup } from '@blueprintjs/core'

import Identicon from 'shared/Identicon'
import {
  CommentThreadBreadcrumbs,
  CommentThreadBreadcrumb,
  ScrollView,
} from 'conversation/shared'

import { styles } from 'card/draftConfig'

const SelectedCommentThread = () => (
  <Container>
    <ScrollView maxHeight="calc(100vh - 163px)">
      <CommentsContainer>
        <LeadCommenter>
          <Identicon
            width={32}
            reader={{
              imageUrl: null,
              email: 'abrodkey@umich.edu',
              name: 'Aaron',
            }}
          />
          <cite>Aaron Brodkey</cite>
        </LeadCommenter>

        <CommentThreadLocation>
          <CommentThreadBreadcrumbs>
            <CommentThreadBreadcrumb>
              Comments on “What is the Superfund?”
            </CommentThreadBreadcrumb>
            <CommentThreadBreadcrumb>Card 1</CommentThreadBreadcrumb>
          </CommentThreadBreadcrumbs>
          <HighlightedText>
            <span
              className="CommentThread__metadata__text"
              style={styles.purpleHighlight}
            >
              the program has suffered from under-funding since 1996, when the
              tax creating the Superfund was allowed to expire
            </span>
          </HighlightedText>
        </CommentThreadLocation>

        <LeadComment>
          <SmallGreyText>March 20, 2017 · 10:56 AM</SmallGreyText>
          <blockquote>
            This has led to less cleanups and liability that may sometimes
            unfairly affect principal responsible parties
          </blockquote>
        </LeadComment>

        <Responses>
          <Timestamp>March 20, 2017 · 11:20 AM</Timestamp>
          <ResponseGroup>
            <SmallGreyText>Cameron Bothner</SmallGreyText>
            <Response>
              I’m kind of not sure that I understand what you’re getting at
              here. Can you clarify for me?
            </Response>
            <Response>What do you mean by this?</Response>
            <Identicon
              width={32}
              reader={{
                imageUrl: null,
                email: 'cameronbothner@gmail.com',
                name: 'Cameron',
              }}
            />
          </ResponseGroup>
          <ResponseGroup>
            <SmallGreyText>Aaron Brodkey</SmallGreyText>
            <Response>
              Oh sure really what I mean is that the cleanups and liability that
              sometimes come after can be unfair.
            </Response>
            <Identicon
              width={32}
              reader={{
                imageUrl: null,
                email: 'abrodkey@umich.edu',
                name: 'Aaron',
              }}
            />
          </ResponseGroup>
          <Timestamp>March 20, 2017 · 11:20 AM</Timestamp>
          <ResponseGroup>
            <SmallGreyText>Cameron Bothner</SmallGreyText>
            <Response>
              I’m kind of not sure that I understand what you’re getting at
              here. Can you clarify for me?
            </Response>
            <Response>What do you mean by this?</Response>
            <Identicon
              width={32}
              reader={{
                imageUrl: null,
                email: 'cameronbothner@gmail.com',
                name: 'Cameron',
              }}
            />
          </ResponseGroup>
          <ResponseGroup>
            <SmallGreyText>Aaron Brodkey</SmallGreyText>
            <Response>
              Oh sure really what I mean is that the cleanups and liability that
              sometimes come after can be unfair.
            </Response>
            <Identicon
              width={32}
              reader={{
                imageUrl: null,
                email: 'abrodkey@umich.edu',
                name: 'Aaron',
              }}
            />
          </ResponseGroup>
        </Responses>
      </CommentsContainer>
    </ScrollView>

    <NewCommentForm>
      <Identicon
        width={32}
        reader={{
          imageUrl: null,
          email: 'cameronbothner@gmail.com',
          name: 'Cameron',
        }}
      />
      <InputGroup
        placeholder="Write a message"
        rightElement={
          <button className="pt-button pt-minimal pt-intent-primary pt-icon-upload" />
        }
      />
    </NewCommentForm>
  </Container>
)
export default SelectedCommentThread

const Container = styled.div`
  flex: 1;
  max-width: 633px;
  margin-left: 36px;
  position: relative;

  &::before {
    position: absolute;
    box-shadow: inset 0px 16px 16px -16px #35526f;
    top: 0;
    width: 100%;
    height: 10px;
    content: '';
    z-index: 100;
  }
`

const CommentsContainer = styled.div`
  margin-top: 30px;
  padding: 30px;
  background-color: #ebeae4;
  border-radius: 2px 2px 0 0;
`

const LeadCommenter = styled.div`
  display: flex;
  align-items: baseline;

  & > cite {
    font-style: normal;
    margin-left: 12px;
  }
`

const CommentThreadLocation = styled.div`
  margin: 18px 0 28px;
`

const HighlightedText = styled.div`
  font-size: 17px;
  line-height: 1.6;
  margin-top: -2px;
`

const LeadComment = styled.div`
  margin: 20px 0 50px;

  & > blockquote {
    padding: 0;
    border: none;
    font-size: 17px;
    line-height: 1.3;
  }
`

const SmallGreyText = styled.span`
  font-size: 14px;
  color: #5c7080;
  line-height: 1.2;
`

const Responses = styled.div``

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

const NewCommentForm = styled.div`
  display: flex;
  align-items: center;
  background-color: #ebeae4;
  border-top: 1px solid #bfbdac;
  border-radius: 0 0 2px 2px;
  padding: 11px;

  & .pt-input-group {
    flex: 1;
    margin-left: 11px;
  }
`
