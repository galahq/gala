/**
 * @providesModule CommentThreadsCard
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import styled from 'styled-components'
import { Portal } from '@blueprintjs/core'

import { acceptSelection } from 'redux/actions'

import { FormattedMessage } from 'react-intl'

import CommentThreadItem from 'conversation/CommentThreadItem'
import CommentsCard from 'comments/CommentsCard'
import NewCommentButton from 'comments/NewCommentButton'
import { FocusContainer } from 'utility/A11y'
import { CommentThreadBreadcrumbs } from 'conversation/shared'
import ScrollView from 'utility/ScrollView'

import { Link, Route, matchPath } from 'react-router-dom'
import { elementOpen, commentsOpen } from 'shared/routes'

import type { ContextRouter } from 'react-router-dom'
import type { State } from 'redux/state'

type OwnProps = ContextRouter & {
  cardId: string,
  addCommentThread: () => Promise<void>,
}
function mapStateToProps (state: State, { cardId, location }: OwnProps) {
  const params = matchPath(location.pathname, elementOpen())
  if (params == null) {
    throw new Error('CommentThreadsCard should not be mounted at this route.')
  }

  return {
    commentThreads: state.cardsById[cardId].commentThreads,
    closeCommentThreadsPath: params.url,
  }
}

const CommentThreadsCard = ({
  acceptSelection,
  addCommentThread,
  cardId,
  closeCommentThreadsPath,
  commentThreads,
  history,
  intl,
  location,
  match,
}) => {
  if (commentThreads == null) return null

  return (
    <Container>
      <FocusContainer priority={1}>
        <CommentThreadsWindow>
          <Header>
            <CloseButton
              replace
              aria-label={intl.formatMessage({ id: 'helpers.close' })}
              to={closeCommentThreadsPath}
              onClick={() => acceptSelection(false)}
            />

            <FormattedMessage
              id="commentThreads.index.nCommentThreads.js"
              values={{ count: commentThreads.length }}
            />

            <div style={{ width: 28 }} />
          </Header>

          <List>
            {commentThreads.length === 0 && (
              <Small>
                <FormattedMessage id="comments.index.noComments" />
              </Small>
            )}
            <ScrollView maxHeightOffset="187px">
              {commentThreads.map(({ id }, i) => (
                <CommentThreadItem key={id} id={id} />
              ))}
            </ScrollView>
          </List>

          <Footer>
            <NewCommentButton
              cardId={cardId}
              addCommentThread={addCommentThread}
            />
          </Footer>
        </CommentThreadsWindow>
      </FocusContainer>

      {
        <Portal>
          <Backdrop
            replace
            to={closeCommentThreadsPath}
            onClick={() => acceptSelection(false)}
          />
        </Portal>
      }

      <Route {...commentsOpen()} component={CommentsCard} />
    </Container>
  )
}

export default injectIntl(
  connect(
    mapStateToProps,
    { acceptSelection }
  )(CommentThreadsCard)
)

const List = styled.ol`
  margin: 0;
  padding: 0;
  min-height: 1em;
  background-color: #ebeae4;

  &::before {
    position: absolute;
    box-shadow: inset 0px 16px 16px -16px #3c2e65;
    top: 27px;
    width: 100%;
    height: 10px;
    content: '';
    z-index: 100;

    @media (max-width: 513px) {
      top: 40px;
      width: calc(100% - 24px);
    }
  }
`

const Container = styled.div`
  position: fixed;
  top: 30px;
  width: 267px;
  font-family: ${p => p.theme.sansFont};
  font-size: 12pt;
  transition: margin-left 0.3s;

  margin-left: 756px;
  @media (max-width: 1600px) {
    .Card.has-comments-open & {
      margin-left: 585px;
    }
  }
  @media (max-width: 1438px) {
    margin-left: 585px;
  }
  @media (max-width: 1024px) {
    margin-left: 426px;
    .Card.has-comments-open & {
      margin-left: 426px;
    }
  }
  @media (max-width: 768px) {
    margin-left: 236px;
    .Card.has-comments-open & {
      margin-left: 236px;
    }
  }

  @media (max-width: 513px) {
    margin-left: 0;
    .Card.has-comments-open & {
      margin-left: 0;
    }

    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    padding: 12px;
    background-color: #35536f;
    z-index: 10;

    .accepting-selection & {
      left: -10000px;
    }
  }

  & ${List} ${CommentThreadBreadcrumbs} {
    display: none;
  }
`

const CommentThreadsWindow = styled.div`
  background-color: #7351d4;
  box-shadow: 0 0.5em 1em rgba(0, 0, 0, 0.3);
  border-radius: 2px;

  @media (max-width: 1279px) {
    .Card.has-comments-open & {
      display: none;
    }
  }
`

const Header = styled.div.attrs({ className: 'bp3-dark' })`
  background-color: #493092;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 500;
  font-size: 10pt;
  color: white;
  padding: 2px 0 0;
  border-radius: 2px 2px 0 0;
  border-bottom: 1px solid #351d7a;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`

const CloseButton = styled(Link).attrs({
  className: 'bp3-button bp3-minimal bp3-icon-cross bp3-small',
})`
  margin: -2px 2px 0;
  &:before {
    color: white !important;
  }
`

const Footer = styled.div`
  background-color: #493092;
  border-radius: 0 0 2px 2px;
  border-top: 1px solid #351d7a;
  padding: 0.25em;
  display: flex;
`

const Backdrop = styled(Link)`
  position: fixed;
  background-color: rgba(0, 0, 0, 0.5);
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 200;
`

const Small = styled.small`
  display: block;
  font-size: 90%;
  opacity: 0.8;
  padding: 0.75em 0 0.5em;
  text-align: center;
`
