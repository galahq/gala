/**
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { FormattedDate } from 'react-intl'

export const CommentThreadBreadcrumbs = styled.ul.attrs({
  className: 'pt-breadcrumbs',
})`
  display: flex;
  white-space: nowrap;
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

const StyledBreadcrumbLink = styled.a.attrs({ className: 'pt-breadcrumb' })`
  font-size: 14px;
  ${({ quotation }) =>
    quotation &&
    css`
      color: black;
      font-family: 'freight-text-pro';
      font-size: 15px;

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

export const ScrollView = styled.div`
  max-height: ${({ maxHeightOffset }) =>
    `calc(100vh - (${maxHeightOffset}))` || '100vh'};
  overflow: scroll;
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

export const NoSelectedCommentThread = styled.div`
  flex: 1;
  max-width: 633px;
  height: calc(100vh - 140px);
  margin: 30px 0 0 36px;
  padding: 30px;
  background-color: #415e77;
  border-radius: 2px;
`
