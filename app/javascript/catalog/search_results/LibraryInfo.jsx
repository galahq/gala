/**
 * @providesModule LibraryInfo
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { withRouter } from 'react-router-dom'
import { Orchard } from 'shared/orchard'
import { FormattedMessage } from 'react-intl'
import DocumentTitle from 'react-document-title'

import LibraryLogo from 'overview/LibraryLogo'
import { CatalogSection, SectionTitle } from 'catalog/shared'

import type { ContextRouter } from 'react-router-dom'

type Props = {| ...ContextRouter, slug: string |}
function LibraryInfo({ history, slug }: Props) {
  const [library, setLibrary] = React.useState(null)

  async function fetchLibraryInfo() {
    try {
      const data = await Orchard.harvest(`libraries/${slug}`)
      setLibrary(data)
    } catch {
      history.replace('/')
    }
  }

  React.useEffect(() => {
    fetchLibraryInfo()
  }, [slug])

  if (library == null) return null

  const { name, description, url } = library

  return (
    <DocumentTitle title={`${name} — Gala`}>
      <CatalogSection solid>
        <RightFloatLogoContainer>
          <LibraryLogo library={library} />
        </RightFloatLogoContainer>
        <SectionTitle>{name}</SectionTitle>
        <Description>{description}</Description>
        {url && (
          <LearnMore href={url}>
            <FormattedMessage id="catalog.learnMore" /> ›
          </LearnMore>
        )}
      </CatalogSection>
    </DocumentTitle>
  )
}
// $FlowFixMe
export default withRouter(LibraryInfo)

const RightFloatLogoContainer = styled.div`
  position: relative;
  float: right;
  width: 67px;
  height: 90px;
  margin: -10px 20px 10px 0;
  pointer-events: none;
`
const Description = styled.p`
  color: #ebeae4;
  margin-bottom: 0.5em;
`
const LearnMore = styled.a`
  color: #6acb72;
  &:hover {
    color: #6acb72;
    text-decoration: underline;
  }
`
