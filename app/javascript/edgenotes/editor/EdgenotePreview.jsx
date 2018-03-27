/**
 * Coordinates the display of a preview Edgenote and options for the automatic
 * components of that preview.
 *
 * @providesModule EdgenotePreview
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import * as R from 'ramda'
import { Switch } from '@blueprintjs/core'

import { EdgenoteFigure } from 'edgenotes/Edgenote'

import type { Edgenote } from 'redux/state'
import type { ChangesToAttachments } from './index'

type Props = {
  contents: Edgenote,
  changesToAttachments: ChangesToAttachments,
}

const EdgenotePreview = ({ contents, changesToAttachments }: Props) => (
  <React.Fragment>
    <h5>
      <FormattedMessage id="edgenotes.edit.preview" />
    </h5>

    <Card>
      <EdgenoteFigure
        contents={edgenotePreviewProps(contents, changesToAttachments)}
        embedded={true}
      />
    </Card>

    <Switch
      checked={false}
      label={<FormattedMessage id="edgenotes.edit.useEmbed" />}
    />
    <Switch
      checked={true}
      label={<FormattedMessage id="edgenotes.edit.usePreviewImage" />}
    />
    <Switch
      checked={true}
      label={<FormattedMessage id="edgenotes.edit.usePreviewDescription" />}
    />
  </React.Fragment>
)

export default EdgenotePreview

function edgenotePreviewProps (contents, changesToAttachments) {
  const havingChanges = R.filter(Boolean)
  const objectUrls = R.map(attachment => attachment && attachment.objectUrl)
  return {
    ...contents,
    ...objectUrls(havingChanges(changesToAttachments)),
    imageThumbnailUrl: undefined,
  }
}

const Card = styled.div.attrs({ className: 'pt-card pt-dark pt-elevation-3' })`
  margin-bottom: 2rem;

  & .edge {
    width: auto;
  }
`
