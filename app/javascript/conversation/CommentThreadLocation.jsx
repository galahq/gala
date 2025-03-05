/**
 * @providesModule CommentThreadLocation
 * @flow
 */

import React from 'react'
import styled, { css } from 'styled-components'

import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import {
  CommentThreadBreadcrumbs,
  CommentThreadBreadcrumb,
} from 'conversation/shared'
import { styles } from 'draft/config'

import type { Page } from 'redux/state'

type Props = {
  cardPosition: ?number,
  detached: boolean,
  inSitu: ?boolean,
  inSituPath: ?string,
  originalHighlightText: ?string,
  page: ?Page,
}

export default function CommentThreadLocation ({
  cardPosition,
  detached,
  inSitu,
  inSituPath,
  originalHighlightText,
  page,
}: Props) {
  if (page == null || inSituPath == null) return null

  return (
    <Container>
      {detached && (
        <Callout>
          <FormattedMessage id="commentThreads.show.textChanged" />
        </Callout>
      )}

      <CommentThreadBreadcrumbs>
        <CommentThreadBreadcrumb>
          {inSitu ? (
            <FormattedMessage
              id="commentThreads.show.commentsOnPageNumber"
              values={{ position: page.position }}
            />
          ) : (
            <FormattedMessage
              id="commentThreads.show.commentsOnPage"
              values={{ title: page.title }}
            />
          )}
        </CommentThreadBreadcrumb>
        <CommentThreadBreadcrumb>
          <FormattedMessage
            id="commentThreads.show.cardN"
            values={{ cardPosition }}
          />
        </CommentThreadBreadcrumb>
      </CommentThreadBreadcrumbs>

      <HighlightedText disabled={inSitu}>
        <Link
          to={inSituPath}
          className="CommentThread__metadata__text"
          style={styles.purpleHighlight}
        >
          {originalHighlightText}
        </Link>
      </HighlightedText>
    </Container>
  )
}

const Container = styled.div`
  margin: 18px 0 28px;
`

const Callout = styled.div.attrs({ className: 'bp3-callout bp3-icon-error' })`
  line-height: 1.3;
  font-weight: 400;
  margin-bottom: 1em;
`

const HighlightedText = styled.div`
  font-size: 17px;
  line-height: 1.6;
  margin-top: -2px;

  ${p =>
    p.disabled &&
    css`
      pointer-events: none;
    `};
`
