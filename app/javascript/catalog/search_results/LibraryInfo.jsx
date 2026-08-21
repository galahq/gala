/**
 * @providesModule LibraryInfo
 * 
 */

import * as React from 'react'
import styled from 'styled-components'

import { withRouter } from 'react-router-dom'
import { Orchard } from 'shared/orchard'
import { FormattedMessage } from 'react-intl'
import DocumentTitle from 'react-document-title'

import LibraryLogo from 'overview/LibraryLogo'
import { CatalogSection, SectionTitle } from 'catalog/shared'


function LibraryInfo({ history, slug }) {
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

  const parsedDescription = parseDescription(description);
  
  function parseDescription(description) {  
    if (description==null) return ""
    else if (description.includes('\n')) return description.split('\n').map((paragraph)=><p>{paragraph}</p>)
    else return description;
}

  return (
    <DocumentTitle title={`${name} — Gala`}>
      <CatalogSection solid>
        <RightFloatLogoContainer>
          <LibraryLogo library={library} />
        </RightFloatLogoContainer>
        <SectionTitle>{name}</SectionTitle>
        <Description>{parsedDescription}</Description>
        {url && (
          <LearnMore href={url}>
            <FormattedMessage id="catalog.learnMore" /> ›
          </LearnMore>
        )}
      </CatalogSection>
    </DocumentTitle>
  )
}
export default withRouter(LibraryInfo)

const RightFloatLogoContainer = styled.div`
  position: relative;
  float: right;
  width: 67px;
  height: 90px;
  /* left margin gives wrapping text (e.g. the "…is an" line) breathing room from
     the logo — for a float:right that gap can only come from the left margin. The
     right margin is trimmed by the same amount so the logo scoots into the empty
     space on its right instead of narrowing the text column. */
  margin: -10px 8px 10px 12px;
  pointer-events: none;
`
const Description = styled.div`
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
