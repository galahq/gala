/**
 * Provides switches to disable the embed, image, and description that might be
 * automatically generated as part of the LinkExpansion.
 *
 * @providesModule ExpansionVisibilityForm
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { Switch } from '@blueprintjs/core'
import LinkExpansion from 'edgenotes/expansion/LinkExpansion'
import Attachment from 'edgenotes/editor/Attachment'

import type { Edgenote } from 'redux/state'
import type { ILinkExpansion } from 'edgenotes/expansion/LinkExpansion'
import type { VisibilityChangeProps } from './withVisibilityChanges'

type Props = {
  contents: Edgenote,
  expansion: ILinkExpansion,
  ...VisibilityChangeProps,
}

const ExpansionVisibilityForm = ({
  contents,
  expansion,
  visibility,
  toggleVisibility,
}: Props) => {
  if (!(expansion instanceof LinkExpansion)) return null

  const { embed, preview } = expansion
  const { noDescription, noEmbed, noImage } = visibility

  const checked = {
    embed: noEmbed != null ? !noEmbed : !!embed && !!embed.__html,
    image:
      noImage != null
        ? !noImage
        : !!preview.images && preview.images.length > 0,
    description: noDescription != null ? !noDescription : !!preview.description,
  }

  const visible = {
    embed: embed == null || embed.__html != null,
    image: !checked.embed && !contents.pullQuote,
    description: !checked.embed && !contents.pullQuote,
  }

  const disabled = {
    image: Attachment.truthy(contents.imageUrl),
    description: !!contents.caption,
  }

  return (
    <React.Fragment>
      {visible.embed && (
        <Switch
          checked={checked.embed}
          label={<FormattedMessage id="edgenotes.edit.useEmbed" />}
          onChange={() => toggleVisibility('noEmbed')}
        />
      )}

      {visible.image && (
        <Switch
          checked={checked.image}
          disabled={disabled.image}
          label={<FormattedMessage id="edgenotes.edit.usePreviewImage" />}
          onChange={() => toggleVisibility('noImage')}
        />
      )}

      {visible.description && (
        <Switch
          checked={checked.description}
          disabled={disabled.description}
          label={<FormattedMessage id="edgenotes.edit.usePreviewDescription" />}
          onChange={() => toggleVisibility('noDescription')}
        />
      )}
    </React.Fragment>
  )
}

export default ExpansionVisibilityForm
