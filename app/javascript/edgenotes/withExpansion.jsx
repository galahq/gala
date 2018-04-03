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
import styled, { css } from 'styled-components'

import { FormattedMessage } from 'react-intl'
import { Switch } from '@blueprintjs/core'
import EmbedContainer from 'react-oembed-container'

import { Orchard } from 'shared/orchard'

import type { Edgenote, LinkExpansionVisibility } from 'redux/state'

export type ExpansionProps = {|
  actsAsLink: boolean,
  expansion: React.Node,
  expansionForm: React.Node,
  linkDomain: string,
  onChangeUrl: string => mixed,
  visibility: LinkExpansionVisibility,
|}

type BaseProps = {
  contents: Edgenote,
}

type State = {
  expansion: ?{
    preview: {
      title: string,
      type: string,
      url: string,
      description?: string,
      images?: string[],
    },
    embed?: { __html?: string },
  },
  url: string,
  visibility: LinkExpansionVisibility,
}

export default function withExpansion<Props: BaseProps> (
  Component: React.ComponentType<{ ...Props, ...ExpansionProps }>
): React.ComponentType<Props> {
  class WrapperComponent extends React.Component<Props, State> {
    state = {
      expansion: null,
      url: this.props.contents.websiteUrl,
      visibility: {},
    }

    componentDidMount () {
      this._fetchExpansion(this.state.url).then(expansion =>
        this.setState({ expansion })
      )
    }

    componentDidUpdate (prevProps: BaseProps, prevState: State) {
      if (
        prevProps.contents.updatedAt !== this.props.contents.updatedAt ||
        prevState.url !== this.state.url
      ) {
        this._fetchExpansion(this.state.url).then(expansion =>
          this.setState({ expansion })
        )
      }

      if (prevProps.contents.websiteUrl !== this.props.contents.websiteUrl) {
        const url = this.props.contents.websiteUrl
        this.setState({ url })
      }
    }

    render () {
      return (
        <Component
          {...this.props}
          actsAsLink={this._actsAsLink()}
          expansion={this.renderExpansion()}
          expansionForm={this.renderExpansionForm()}
          linkDomain={this._linkDomain()}
          visibility={this.state.visibility}
          onChangeUrl={this.handleChangeUrl}
        />
      )
    }

    renderExpansion () {
      const { expansion, visibility } = this.state
      if (!expansion) return null

      const { contents } = this.props
      const { pullQuote, imageUrl, caption } = contents
      if (pullQuote || (imageUrl && caption)) return null

      const { embed, preview } = expansion
      const { noDescription, noEmbed, noImage } = visibility
      return embed && embed.__html && !noEmbed ? (
        <EmbedContainer markup={embed.__html}>
          <Embed
            dangerouslySetInnerHTML={embed}
            widescreen={this._widescreenRatio()}
          />
        </EmbedContainer>
      ) : (
        preview && (
          <Container>
            {noImage ||
              !!imageUrl ||
              (preview.images instanceof Array && (
                <Image src={preview.images[0]} />
              ))}
            <Text>
              <Title>{preview.title}</Title>
              {noDescription ||
                !!caption ||
                (preview.description && (
                  <Description>{preview.description}</Description>
                ))}
            </Text>
          </Container>
        )
      )
    }

    renderExpansionForm () {
      const { contents } = this.props
      const { expansion, visibility } = this.state
      const { embed, preview } = expansion || {}
      const { noDescription, noEmbed, noImage } = visibility
      return (
        expansion && (
          <React.Fragment>
            {(embed == null || embed.__html != null) && (
              <Switch
                checked={noEmbed != null ? !noEmbed : embed != null}
                label={<FormattedMessage id="edgenotes.edit.useEmbed" />}
                onChange={this.handleToggleEmbed}
              />
            )}

            <Switch
              checked={noImage != null ? !noImage : preview.images != null}
              label={<FormattedMessage id="edgenotes.edit.usePreviewImage" />}
              onChange={this.handleToggleImage}
            />

            {!!contents.caption || (
              <Switch
                checked={
                  noDescription != null
                    ? !noDescription
                    : preview.description != null
                }
                label={
                  <FormattedMessage id="edgenotes.edit.usePreviewDescription" />
                }
                onChange={this.handleToggleDescription}
              />
            )}
          </React.Fragment>
        )
      )
    }

    handleChangeUrl = (url: string) => this.setState({ url })

    handleToggleEmbed = () =>
      this.setState(s => ({
        ...s,
        visibility: { ...s.visibility, noEmbed: !s.visibility.noEmbed },
      }))

    handleToggleImage = () =>
      this.setState(s => ({
        ...s,
        visibility: { ...s.visibility, noImage: !s.visibility.noImage },
      }))

    handleToggleDescription = () =>
      this.setState(s => ({
        ...s,
        visibility: {
          ...s.visibility,
          noDescription: !s.visibility.noDescription,
        },
      }))

    _actsAsLink () {
      const { expansion } = this.state
      if (expansion == null) return true

      const { embed } = expansion
      return !(embed && embed.__html)
    }

    _linkDomain () {
      const { url } = this.state
      return url && new URL(url).host.replace(/^www\./, '')
    }

    _widescreenRatio () {
      return ['youtube.com', 'live.amcharts.com', 'vimeo.com'].includes(
        this._linkDomain()
      )
    }

    async _fetchExpansion (url: string) {
      const { slug, updatedAt } = this.props.contents

      if (!url) return null

      return Orchard.harvest(`edgenotes/${slug}/link_expansion`, {
        href: url,
        updatedAt,
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

const Embed = styled.div`
  iframe {
    width: 100%;
  }

  ${p =>
    p.widescreen &&
    css`
      position: relative;
      padding-bottom: 56.25%; /* 16:9 */
      height: 0;

      iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    `};
`
