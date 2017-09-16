/**
 * @providesModule Sidebar
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import { identigradient } from 'shared/identigradient'
import { Element, ElementImage } from 'catalog/shared'
import Enrollments from 'catalog/Enrollments'
import SignInForm from 'utility/SignInForm'

import type { Case, Reader } from 'redux/state'
import type Catalog from 'catalog'

type Props = {
  reader: ?Reader | { loading: true },
  enrolledCases: Case[],
  onDeleteEnrollment: $PropertyType<Catalog, 'handleDeleteEnrollment'>,
}
const Sidebar = ({ reader, enrolledCases, onDeleteEnrollment }: Props) => (
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
        <Enrollments
          enrolledCases={enrolledCases}
          onDeleteEnrollment={onDeleteEnrollment}
        />
      </div>
    )}
  </Container>
)

export default Sidebar

const Container = styled.aside`
  width: 18em;
  @media (max-width: 700px) {
    width: 100%;
  }

  margin: 0 0.5em 2em;
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
