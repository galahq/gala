/**
 * Presents download and upload links for the teaching guide attachment
 *
 * @providesModule TeachingGuide
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import ActiveStorageProvider from 'react-activestorage-provider'
import { FormattedMessage } from 'react-intl'
import { Icon } from '@blueprintjs/core'
import { isBlank } from 'shared/functions'
import FileUploadWidget from 'utility/FileUploadWidget'

import typeof { updateCase } from 'redux/actions'

type Props = {
  caseSlug: string,
  editing: boolean,
  teachingGuideUrl: string,
  updateCase: updateCase,
}

const TeachingGuide = ({
  editing,
  teachingGuideUrl,
  updateCase,
  caseSlug,
}: Props) => (
  <Container>
    {editing ? (
      <ActiveStorageProvider
        endpoint={{
          path: `/cases/${caseSlug}`,
          model: 'Case',
          attribute: 'teaching_guide',
          method: 'PUT',
        }}
        render={renderProps => (
          <InlineFileUploadWidget
            accept="*"
            message={{ id: 'cases.edit.uploadTeachingGuide' }}
            {...renderProps}
          />
        )}
        onSubmit={({ teachingGuideUrl }: Props) =>
          updateCase({ teachingGuideUrl }, false)
        }
      />
    ) : (
      isBlank(teachingGuideUrl) || (
        <a href={teachingGuideUrl}>
          <Icon icon="download" />
          <FormattedMessage id="cases.show.downloadTeachingGuide" />
        </a>
      )
    )}
  </Container>
)

export default TeachingGuide

const Container = styled.div`
  font-family: ${p => p.theme.sansFont};
  font-size: 12pt;
  margin-top: 1em;

  .pt-icon {
    margin-right: 0.5em;
    vertical-align: middle;
  }
`

const InlineFileUploadWidget = styled(FileUploadWidget)`
  display: inline-block;
`
