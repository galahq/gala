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

import { EdgenoteFigure } from 'edgenotes/Edgenote'

import type { Edgenote } from 'redux/state'
import type { ChangesToAttachments } from 'edgenotes/editor'
import type { ILinkExpansion } from 'edgenotes/expansion/LinkExpansion'

type Props = {
  contents: Edgenote,
  changesToAttachments: ChangesToAttachments,
  expansion: ILinkExpansion,
}

const EdgenotePreview = ({
  contents,
  changesToAttachments,
  expansion,
}: Props) => (
  <>
    <h5>
      <FormattedMessage id="edgenotes.edit.preview" />
    </h5>

    <Card>
      <EdgenoteFigure
        contents={edgenotePreviewProps(contents, changesToAttachments)}
        embedded={true}
        expansion={expansion}
        i={0}
      />
    </Card>
  </>
)

export default EdgenotePreview

function edgenotePreviewProps (contents, changesToAttachments) {
  const havingChanges = R.filter(Boolean)
  const objectUrls = R.map(attachment => attachment?.objectUrl)
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

  figure {
    margin-top: 1rem !important;
  }

`
