/**
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { FormattedDate } from 'react-intl'
import Markdown from 'utility/Markdown'

// $FlowFixMe
export const CommentThreadBreadcrumbs = styled.ul.attrs({
  className: 'bp3-breadcrumbs',
})`
  display: flex;
  align-items: baseline;
  white-space: nowrap;

  display: grid;
  grid-template-columns: min-content auto;
`

type CommentThreadBreadcrumbProps = {
  href?: string,
  quotation?: boolean,
  children: React.Node,
}
export const CommentThreadBreadcrumb = ({
  href,
  quotation,
  children,
}: CommentThreadBreadcrumbProps) => {
  const Breadcrumb = href
    ? StyledBreadcrumbLink
    : StyledBreadcrumbLink.withComponent('span')
  return (
    <TruncatingLI quotation={quotation}>
      <Breadcrumb href={href} quotation={quotation}>
        <OptionalUnderline quotation={quotation}>{children}</OptionalUnderline>
      </Breadcrumb>
    </TruncatingLI>
  )
}

const TruncatingLI = styled.li`
  ${({ quotation }) =>
    quotation &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
    `};
`

const StyledBreadcrumbLink = styled.a.attrs({ className: 'bp3-breadcrumb' })`
  font-size: 14px;
  ${({ quotation }) =>
    quotation &&
    css`
      color: black;
      font-family: ${p => p.theme.serifFont};
      font-size: 15px;
      display: block;

      &::before {
        content: '“';
      }
      &::after {
        content: '”';
      }
    `};
`

const OptionalUnderline = styled.span.attrs({
  className: ({ quotation }) => (quotation ? 'has-text-shadow' : ''),
})`
  ${({ quotation }) =>
    quotation &&
    css`
      background: linear-gradient(rgb(115, 81, 212), rgb(115, 81, 212)) 0px 90% /
        1px 1px repeat-x;
      text-shadow: rgb(235, 234, 228) 0.03em 0px, rgb(235, 234, 228) -0.03em 0px,
        rgb(235, 234, 228) 0px 0.03em, rgb(235, 234, 228) 0px -0.03em,
        rgb(235, 234, 228) 0.06em 0px, rgb(235, 234, 228) -0.06em 0px,
        rgb(235, 234, 228) 0.09em 0px, rgb(235, 234, 228) -0.09em 0px,
        rgb(235, 234, 228) 0.12em 0px, rgb(235, 234, 228) -0.12em 0px,
        rgb(235, 234, 228) 0.15em 0px, rgb(235, 234, 228) -0.15em 0px;
    `};
`

export const SmallGreyText = styled.span`
  font-size: 14px;
  color: #5c7080;
  line-height: 1.2;
`

const CONVERSATION_TIME_FORMAT = { hour: 'numeric', minute: 'numeric' }
const CONVERSATION_DATE_FORMAT = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}
export const ConversationTimestamp = ({ value }: { value: string }) => (
  <span>
    <FormattedDate {...CONVERSATION_DATE_FORMAT} value={value} /> ·{' '}
    <FormattedDate {...CONVERSATION_TIME_FORMAT} value={value} />
  </span>
)

export const StyledComment = ({ markdown }: { markdown: string }) => (
  <StyledCommentContainer>
    <Markdown source={markdown} />
  </StyledCommentContainer>
)
export const StyledCommentContainer = styled.div`
  ${({ hidePlaceholder }) =>
    hidePlaceholder &&
    css`
      & .public-DraftEditorPlaceholder-root {
        display: none;
      }
    `};

  flex: 1;
  hyphens: auto;
  line-height: 1.4;

  & strong {
    letter-spacing: normal;
    font-weight: bold;
  }

  & h1,
  & h2,
  & h3,
  & h4,
  & h5,
  & h6 {
    color: black;
    font-family: ${p => p.theme.sansFont};
    font-size: 1.2em;
    margin: 1em 0 0.3em;
    &:first-child {
      margin-top: 0.2em;
    }
  }

  & blockquote {
    font-size: inherit;
    line-height: 1.3em;
    margin: 0 0 0.625em;
  }

  & ol,
  & ul {
    line-height: 1.3;
    margin-top: 0;

    & li:not(:last-child) {
      margin-bottom: 4px;
    }
  }

  & div > .public-DraftStyleDefault-block,
  & p {
    /* Unstyled paragraphs */
    margin: 0 0 0.625em;
  }

  & div:last-child > .public-DraftStyleDefault-block,
  & p:last-child,
  & ul:last-child,
  & ol:last-child,
  & blockquote:last-child {
    margin-bottom: 0;
  }
`
