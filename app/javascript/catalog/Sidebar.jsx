/**
 * @providesModule Sidebar
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import { Button } from '@blueprintjs/core'

import { identigradient } from 'shared/identigradient'
import { SectionTitle, CaseRow, CaseLinkRow } from 'catalog/shared'
import SignInForm from 'utility/SignInForm'

import type { Case, Reader } from 'redux/state'

type Props = { reader: ?Reader | { loading: true }, enrolledCases: Case[] }
const Sidebar = ({ reader, enrolledCases }: Props) => (
  <Container>
    {reader == null ? (
      <SignInForm />
    ) : reader.loading ? null : (
      <div className="pt-dark">
        <IdentigradientElement
          image={reader.imageUrl}
          text={reader.name}
          href="/profile/edit"
          hashKey={reader.email}
        />
        <CaseRow baseline>
          <SidebarSectionTitle>Enrolled cases</SidebarSectionTitle>
          <SidebarButton iconName="cog" />
        </CaseRow>
        {enrolledCases.map(
          ({ slug, smallCoverUrl, kicker, url } = {}) =>
            slug && (
              <Element
                key={slug}
                image={smallCoverUrl}
                text={kicker}
                href={url}
              />
            )
        )}
      </div>
    )}
  </Container>
)

export default Sidebar

const Container = styled.aside`
  width: 17em;
  margin: 0 0.5em;
`

const SidebarSectionTitle = SectionTitle.extend`margin: 24px 0.5em 2px 0;`
const SidebarButton = styled(Button).attrs({ className: 'pt-minimal' })`
  margin-right:-10px;
`

type ElementProps = {
  image?: ?string,
  className?: ?string,
  text: string,
  href?: ?string,
  rightElement?: *,
}
const Element = ({
  image,
  text,
  href,
  rightElement,
  className,
}: ElementProps) => {
  const ElementContainer = href == null ? CaseRow : CaseLinkRow
  return (
    <ElementContainer href={href} className={className}>
      <ElementImage src={image} />
      <ElementText>{text}</ElementText>
      {rightElement}
    </ElementContainer>
  )
}

const ElementImage = styled.div.attrs({ role: 'presentation' })`
  width: 36px;
  height: 36px;
  border-radius: 2px;
  background-image: ${({ src }) => `url(${src})`};
  background-size: cover;
  background-position: center;
`
const ElementText = styled.span`
  color: #ebeae4;
  flex: 1;
  margin: 0 14px;
  line-height: 1.1;
`
const NotificationBadge = styled.span`
  height: 20px;
  color: #c1aef8;
  font-size: 13px;
  letter-spacing: 0.5;
`

const IdentigradientElement = styled(Element)`
  & > ${ElementImage} {
    background: ${({ image, hashKey }) =>
      image ? '' : identigradient(hashKey)};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  & > ${ElementImage}::after {
    content: ${({ text, image }) => (image ? '' : `'${text[0]}'`)};
    font-weight: 600;
    color: #ebeae4;
  }
`
