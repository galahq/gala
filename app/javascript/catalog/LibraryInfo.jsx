/**
 * @providesModule LibraryInfo
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { withRouter } from 'react-router-dom'
import { Orchard } from 'shared/orchard'
import { FormattedMessage } from 'react-intl'

import LibraryLogo from 'overview/LibraryLogo'
import { CatalogSection, SectionTitle } from 'catalog/shared'

import type { ContextRouter } from 'react-router-dom'
import type { Library } from 'redux/state'

type Props = ContextRouter & {| slug: string |}
class LibraryInfo extends React.Component<Props, Library> {
  componentDidMount () {
    this._fetchLibraryInfo()
  }

  componentDidUpdate (prevProps: Props) {
    if (this.props.slug !== prevProps.slug) this._fetchLibraryInfo()
  }

  render () {
    if (!this.state) return null

    const { name, description, url } = this.state
    return (
      <CatalogSection solid>
        <RightFloatLogoContainer>
          <LibraryLogo library={this.state} />
        </RightFloatLogoContainer>
        <SectionTitle>{name}</SectionTitle>
        <Description>{description}</Description>
        <LearnMore href={url}>
          <FormattedMessage
            id="catalog.learnMore"
            defaultMessage="Learn more"
          />{' '}
          ›
        </LearnMore>
      </CatalogSection>
    )
  }

  _fetchLibraryInfo = () =>
    Orchard.harvest(`libraries/${this.props.slug}`)
      .then((library: Library) => this.setState(library))
      .catch(() => this.props.history.replace('/'))
}
export default withRouter(LibraryInfo)

const RightFloatLogoContainer = styled.div`
  position: relative;
  float: right;
  width: 67px;
  height: 116px;
  margin: -10px 0 10px 10px;
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
