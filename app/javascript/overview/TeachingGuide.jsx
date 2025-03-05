/**
 * Presents download and upload links for the teaching guide attachment
 *
 * @providesModule TeachingGuide
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import ActiveStorageProvider from 'react-activestorage-provider'
import { FormattedMessage } from 'react-intl'
import { Icon } from '@blueprintjs/core'
import { isBlank } from 'shared/functions'
import FileUploadWidget from 'utility/FileUploadWidget'
import { deleteTeachingGuide, updateCase } from 'redux/actions'

import type { State } from 'redux/state'

function mapStateToProps ({
  edit: { inProgress: editing },
  caseData: { slug: caseSlug, teachingGuideUrl },
}: State) {
  return {
    editing,
    caseSlug,
    teachingGuideUrl,
  }
}

type Props = {
  caseSlug: string,
  deleteTeachingGuide: typeof deleteTeachingGuide,
  editing: boolean,
  teachingGuideUrl: ?string,
  updateCase: typeof updateCase,
}

const TeachingGuide = ({
  caseSlug,
  deleteTeachingGuide,
  editing,
  teachingGuideUrl,
  updateCase,
}: Props) => {
  const blank = isBlank(teachingGuideUrl)
  return (
    <Container>
      {editing ? (
        <>
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
                message={{
                  id: `cases.edit.${blank ? 'upload' : 'replace'}TeachingGuide`,
                }}
                {...renderProps}
              />
            )}
            onSubmit={({ teachingGuideUrl }: Props) =>
              updateCase({ teachingGuideUrl }, false)
            }
          />

          {blank || (
            <DeleteButton onClick={deleteTeachingGuide}>
              <FormattedMessage id="cases.edit.removeTeachingGuide" />
            </DeleteButton>
          )}
        </>
      ) : (
        blank || (
          <a href={teachingGuideUrl}>
            <Icon icon="download" />
            <FormattedMessage id="cases.show.downloadTeachingGuide" />
          </a>
        )
      )}
    </Container>
  )
}

// $FlowFixMe
export default connect(
  mapStateToProps,
  { deleteTeachingGuide, updateCase }
)(TeachingGuide)

const Container = styled.div`
  font-family: ${p => p.theme.sansFont};
  font-size: 12pt;
  margin-top: 1em;
  position: relative;

  .bp3-icon {
    margin-right: 0.5em;
    vertical-align: middle;
  }
`

const DeleteButton = styled.button.attrs({
  className: 'bp3-button bp3-minimal bp3-icon-trash bp3-intent-danger',
})`
  margin-left: 0.5em;
`

const InlineFileUploadWidget = styled(FileUploadWidget)`
  display: inline-block;
`
