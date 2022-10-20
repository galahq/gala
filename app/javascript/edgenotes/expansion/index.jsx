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
import EmbedContainer from 'react-oembed-container'
import { Container, Description, Embed, Image, Text, Title } from './styled'
import LinkExpansion from './LinkExpansion'

import type { ILinkExpansion } from './LinkExpansion'
import type { Edgenote } from 'redux/state'

type Props = {
  contents: Edgenote,
  expansion: ILinkExpansion,
}

const EMBED_RATIOS: { [string]: [number, number] } = {
  'cdn.knightlab.com': [16, 9],
  'live.amcharts.com': [16, 9],
  'soundcloud.com': [21, 9],
  'speakerdeck.com': [1, 1],
  'ted.com': [16, 9],
  'vimeo.com': [16, 9],
  'youtube.com': [16, 9],
  'datastudio.google.com': [1, 1],
  'observablehq.com': [16, 9],
  'crowdsignal.com': [1, 1],
}

const Expansion = ({ contents, expansion }: Props) => {
  if (!(expansion instanceof LinkExpansion)) return null

  const { pullQuote, imageUrl, caption } = contents
  if (pullQuote || (imageUrl && caption)) return null

  const { embed, preview } = expansion

  return embed?.__html ? (
    <EmbedContainer markup={embed?.__html}>
      <Embed
        dangerouslySetInnerHTML={embed}
        ratio={EMBED_RATIOS[expansion.linkDomain]}
      />
    </EmbedContainer>
  ) : (
    preview && preview.title && (
      <Container>
        {!!imageUrl ||
          (preview.images instanceof Array && (
            <Image src={preview.images[0]} />
          ))}
        {!!caption || (
          <Text>
            <Title>{preview.title}</Title>
            {preview.description && (
              <Description>{preview.description}</Description>
            )}
          </Text>
        )}
      </Container>
    )
  )
}

export default Expansion
