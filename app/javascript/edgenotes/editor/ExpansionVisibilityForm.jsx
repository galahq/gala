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
  return (
    <React.Fragment>
      {(embed == null || embed.__html != null) && (
        <Switch
          checked={noEmbed != null ? !noEmbed : embed != null}
          label={<FormattedMessage id="edgenotes.edit.useEmbed" />}
          onChange={() => toggleVisibility('noEmbed')}
        />
      )}

      <Switch
        checked={noImage != null ? !noImage : preview.images != null}
        label={<FormattedMessage id="edgenotes.edit.usePreviewImage" />}
        onChange={() => toggleVisibility('noImage')}
      />

      {!!contents.caption || (
        <Switch
          checked={
            noDescription != null ? !noDescription : preview.description != null
          }
          label={<FormattedMessage id="edgenotes.edit.usePreviewDescription" />}
          onChange={() => toggleVisibility('noDescription')}
        />
      )}
    </React.Fragment>
  )
}

export default ExpansionVisibilityForm
