/**
 * @providesModule CommentsCard
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import SelectedCommentThread from 'conversation/SelectedCommentThread'

import type { ContextRouter } from 'react-router-dom'

const CommentsCard = (props: ContextRouter) => (
  <InlineCommentsCardContainer>
    <SelectedCommentThread inSitu heightOffset={0} {...props} />
  </InlineCommentsCardContainer>
)

export default CommentsCard

const InlineCommentsCardContainer = styled.div`
  position: absolute;
  top: 0;
  left: 18.1em;
  width: 30em;

  & a:hover {
    text-decoration: none !important;
  }

  @media screen and (max-width: 1279px) {
    left: 0;
  }
`
