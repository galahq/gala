/**
 * @providesModule CommentThreadItem
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import {
  CommentThreadBreadcrumbs,
  CommentThreadBreadcrumb,
} from 'conversation/shared'
import Identicon from 'shared/Identicon'

const CommentThreadItem = () => (
  <CommentThreadContainer>
    <CommentThreadBreadcrumbs>
      <CommentThreadBreadcrumb>Beginning in 1984…</CommentThreadBreadcrumb>
      <CommentThreadBreadcrumb quotation>
        the program has suffered from under-funding since 1996, when the tax
        creating the Superfund was allowed to expire
      </CommentThreadBreadcrumb>
    </CommentThreadBreadcrumbs>

    <MostRecentComment>
      To “spray the lawns” Gelman shot a spray of contaminated water high into
      the air, which allowed wind dispersion.
    </MostRecentComment>

    <ConversationMetadata>
      <Indenticons>
        <Identicon
          width={22}
          reader={{
            imageUrl: null,
            email: 'cameronbothner@gmail.com',
            name: 'Cameron',
          }}
        />
      </Indenticons>
      <CommentCount>1 comment</CommentCount>
    </ConversationMetadata>
  </CommentThreadContainer>
)
export default CommentThreadItem

const CommentThreadContainer = styled.div`
  padding: 14px 18px;

  &:not(:last-child) {
    border-bottom: 1px solid #bfbdac;
  }
`

const MostRecentComment = styled.blockquote`
  padding-left: 0;
  border: none;
  font-size: 16px;
  line-height: 1.3;
  margin: 0.25em 0;

  &:first-child {
    margin-top: 7px;
  }
`

const ConversationMetadata = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 14px 0 0.5em;
`
const Indenticons = styled.div``
const CommentCount = styled.div`
  color: #5c7080;
  font-size: 13px;
`
