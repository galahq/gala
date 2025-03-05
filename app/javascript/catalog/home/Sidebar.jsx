/**
 * @providesModule Sidebar
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import { ReaderDataContext } from 'catalog/readerData'
import { Element, ElementImage } from 'catalog/shared'
import MyLibrary from 'catalog/home/MyLibrary'
import SignInForm from 'utility/SignInForm'
import { identiconStyle } from 'shared/Identicon'

const Sidebar = () => {
  const { reader, loading: readerLoading } = React.useContext(ReaderDataContext)

  return (
    <Container>
      {readerLoading ? null : reader == null ? (
        <SignInForm />
      ) : (
        <div className="bp3-dark">
          <IdentigradientElement
            image={reader.imageUrl}
            text={reader.name}
            href="/profile/edit"
            hashKey={reader.hashKey}
          />
          <MyLibrary />
        </div>
      )}
    </Container>
  )
}

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
