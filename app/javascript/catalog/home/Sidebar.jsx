/**
 * @providesModule Sidebar
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import { Element, ElementImage } from 'catalog/shared'
import Enrollments from 'catalog/Enrollments'
import SignInForm from 'utility/SignInForm'
import { identiconStyle } from 'shared/Identicon'

import type { Case, Reader } from 'redux/state'
import type { Loading } from 'catalog'
import typeof Catalog from 'catalog'

type Props = {
  loading: Loading,
  reader: ?Reader,
  enrolledCases: Case[],
  onDeleteEnrollment: $PropertyType<Catalog, 'handleDeleteEnrollment'>,
}
const Sidebar = ({
  loading,
  reader,
  enrolledCases,
  onDeleteEnrollment,
}: Props) => (
  <Container>
    {loading.reader ? null : reader == null ? (
      <SignInForm />
    ) : (
      <div className="pt-dark">
        <IdentigradientElement
          image={reader.imageUrl}
          text={reader.name}
          href="/profile/edit"
          hashKey={reader.hashKey}
        />
        <Enrollments
          loading={loading}
          enrolledCases={enrolledCases}
          onDeleteEnrollment={onDeleteEnrollment}
        />
      </div>
    )}
  </Container>
)

export default Sidebar

export const Container = styled.aside`
  grid-area: sidebar;
  margin: 0 0 1.5em 0;
`

const IdentigradientElement = styled(Element)`
  & > ${ElementImage} {
    ${identiconStyle};
    &:after {
      font-size: 16px;
    }
  }
`
