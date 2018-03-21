/**
 * A link preview or embedded widget derived from an Edgenote’s websiteUrl.
 * Depending on what custom properties the editor has set, this can display
 * more or less from the expansion.
 *
 * # Embed-type expansions
 * The embedded widget is displayed as is. It can have a caption and call to
 * action underneath. The Edgenote can't function as a link overall if we’re
 * displaying the embed.
 *
 * # Preview-type expansions
 * We can display a title, a description, and an image, but we don’t have to.
 * - If the editor has set a custom image, we show that image above a text-only
 *   preview of the title and description.
 * - If the editor has set a custom caption, we display that caption underneath
 *   a preview containing only an image and title.
 * - If the editor has set a pull quote or an image and a caption, we will not
 *   display a preview at all; only the user’s Edgenote contents. The call to
 *   action, in this situation, will default to the link’s domain.
 *
 * @providesModule Expansion
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { Orchard } from 'shared/orchard'

import type { Edgenote } from 'redux/state'

export type ExpansionProps = {
  actsAsLink: boolean,
  linkDomain: string,
  expansion: React.Node,
}

type BaseProps = {
  contents: ?Edgenote,
}

type State = {
  expansion: ?{
    preview: {
      title: string,
      type: string,
      url: string,
      description: string,
      images: string[],
    },
  },
}

export default function withExpansion<Props: BaseProps> (
  Component: React.ComponentType<Props & ExpansionProps>
): React.ComponentType<Props> {
  class WrapperComponent extends React.Component<BaseProps, State> {
    state = { expansion: null }

    componentDidMount () {
      this._fetchExpansion().then(expansion => this.setState({ expansion }))
    }

    componentDidUpdate (prevProps: BaseProps) {
      if (prevProps.contents.websiteUrl === this.props.contents.websiteUrl) {
        return
      }

      this._fetchExpansion().then(expansion => this.setState({ expansion }))
    }

    render () {
      return (
        <Component
          {...this.props}
          actsAsLink={this._actsAsLink()}
          linkDomain={this._linkDomain()}
          expansion={this.renderExpansion()}
        />
      )
    }

    renderExpansion () {
      const { expansion } = this.state
      if (!expansion) return null

      const { contents } = this.props
      const { pullQuote, imageUrl, caption } = contents
      if (pullQuote || (imageUrl && caption)) return null

      const { preview } = expansion
      return (
        preview && (
          <Container>
            {!!imageUrl || <Image src={preview.images[0]} />}
            <Text>
              <Title>{preview.title}</Title>
              {!!caption || <Description>{preview.description}</Description>}
            </Text>
          </Container>
        )
      )
    }

    _actsAsLink () {
      return true
    }

    _linkDomain () {
      const { websiteUrl } = this.props.contents
      return websiteUrl && new URL(websiteUrl).host.replace(/^www\./, '')
    }

    async _fetchExpansion () {
      const { slug, websiteUrl } = this.props.contents

      if (!websiteUrl) return null

      return Orchard.harvest(`edgenotes/${slug}/link_expansion`, {
        href: websiteUrl,
      })
    }
  }

  WrapperComponent.displayName = `withExpansion(${Component.displayName ||
    Component.name})`
  return WrapperComponent
}

const Container = styled.div`
  margin-bottom: -0.5rem;
  position: relative;
`

const Image = styled.img`
  border-top-left-radius: 2pt;
  border-top-right-radius: 2pt;
  width: 100%;
`

const Text = styled.p`
  background-color: #49647d;
  border-radius: 2pt;
  padding: 0.5em 0.75em;

  ${Image} + & {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    margin-top: -6px;
  }
`

const Title = styled.strong`
  display: block;
  font-size: 105%;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.2;
`
const Description = styled.span`
  display: block;
  font-size: 0.8rem;
  line-height: 1.3;
  margin-top: 0.25rem;
`
