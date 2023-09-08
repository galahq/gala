/**
 * Provides switches to disable the embed, image, and description that might be
 * automatically generated as part of the LinkExpansion.
 *
 * @providesModule ExpansionVisibilityForm
 * @flow
 */

import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { Switch, FormGroup } from '@blueprintjs/core'
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
  setVisibility,
}: Props) => {
  if (!(expansion instanceof LinkExpansion)) return null

  const { embed, preview } = expansion
  const { noDescription, noEmbed, noImage } = visibility

  const checked = {
    embed: noEmbed != null ? !noEmbed : !!embed?.__html,
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
    image:
      Attachment.truthy(contents.imageUrl) ||
      (preview.images instanceof Array && preview.images.length === 0),
    description:
      !!contents.caption ||
      (typeof preview.description === 'string' &&
        preview.description.length === 0),
  }

  return (
    <>
      <FormGroup
        label={<FormattedMessage id={'edgenotes.edit.layoutElementsLabel'} />}
      >
        {visible.embed && (
          <Switch
            checked={checked.embed}
            label={<FormattedMessage id="edgenotes.edit.useEmbed" />}
            onChange={() => setVisibility('noEmbed', checked.embed)}
          />
        )}

        {visible.image && (
          <Switch
            checked={checked.image}
            disabled={disabled.image}
            label={<FormattedMessage id="edgenotes.edit.usePreviewImage" />}
            onChange={() => setVisibility('noImage', checked.image)}
          />
        )}

        {visible.description && (
          <Switch
            checked={checked.description}
            disabled={disabled.description}
            label={
              <FormattedMessage id="edgenotes.edit.usePreviewDescription" />
            }
            onChange={() => setVisibility('noDescription', checked.description)}
          />
        )}
      </FormGroup>
    </>
  )
}

export default ExpansionVisibilityForm
