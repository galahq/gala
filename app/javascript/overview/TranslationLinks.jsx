/**
 * A list of links to the other languages a case is translated into
 *
 * @providesModule TranslationLinks
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'

import type { Case } from 'redux/state'

export type TranslationLinksProps = {
  languages: $PropertyType<Case, 'otherAvailableLocales'>,
}
function TranslationLinks ({ languages }: TranslationLinksProps) {
  if (Object.keys(languages).length > 0) {
    return (
      <Container>
        <FormattedMessage id="cases.show.otherLanguages" />
        <List>
          {Object.keys(languages).map(lx => {
            const { name, link } = languages[lx]
            return (
              <li key={lx}>
                <a href={link}>{name}</a>
              </li>
            )
          })}
        </List>
      </Container>
    )
  }
  return <span />
}

export default TranslationLinks

const Container = styled.div`
  font-family: ${p => p.theme.sansFont};
  font-size: 12pt;
  line-height: 1.2;
  margin-top: 1.5em;
`

const List = styled.ul`
  padding: 0;

  li {
    display: inline;

    &:not(:last-child)::after {
      content: ' • ';
    }
  }
`
