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
import type { ExpansionProps } from 'edgenotes/withExpansion'

type Props = {
  contents: Edgenote,
  changesToAttachments: ChangesToAttachments,
  ...ExpansionProps,
}

const EdgenotePreview = ({
  contents,
  changesToAttachments,

  actsAsLink,
  expansion,
  expansionForm,
  linkDomain,
  onChangeUrl,
  visibility,
}: Props) => (
  <React.Fragment>
    <h5>
      <FormattedMessage id="edgenotes.edit.preview" />
    </h5>

    <Card>
      <EdgenoteFigure
        contents={edgenotePreviewProps(contents, changesToAttachments)}
        embedded={true}
        actsAsLink={actsAsLink}
        expansion={expansion}
        expansionForm={expansionForm}
        linkDomain={linkDomain}
        visibility={visibility}
        onChangeUrl={onChangeUrl}
      />
    </Card>

    {expansionForm}
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
