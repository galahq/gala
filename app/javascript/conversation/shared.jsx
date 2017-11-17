/**
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'

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

const OptionalUnderline = styled.span`
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
  max-height: ${({ maxHeight }) => maxHeight || '100vh'};
  overflow: scroll;
`
