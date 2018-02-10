/**
 * @providesModule BillboardTitle
 * @flow
 */

import React from 'react'
import styled, { css } from 'styled-components'
import { connect } from 'react-redux'

import ActiveStorageProvider from 'react-activestorage-provider'
import { EditableText } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'

import { updateCase } from 'redux/actions'

import LibraryLogo from './LibraryLogo'
import AuthorsList from './AuthorsList'

import type { State, CaseDataState, Byline, Library } from 'redux/state'

function mapStateToProps ({ edit, caseData }: State) {
  const {
    slug,
    kicker,
    title,
    photoCredit,
    authors,
    translators,
    acknowledgements,
    coverUrl,
    library,
  } = caseData

  return {
    slug,
    kicker,
    title,
    photoCredit,
    coverUrl,
    authors,
    translators,
    acknowledgements,
    library,
    editing: edit.inProgress,
  }
}

type Props = {
  slug: string,
  editing: boolean,
  kicker: string,
  title: string,
  photoCredit: string,
  coverUrl: string,
  updateCase: ($Shape<CaseDataState>) => void,
  minimal: boolean,
  library: Library,
} & Byline

export const UnconnectedBillboardTitle = ({
  slug,
  editing,
  kicker,
  title,
  photoCredit,
  authors,
  translators,
  acknowledgements,
  coverUrl,
  updateCase,
  minimal,
  library,
}: Props) => {
  return (
    <CoverImageContainer src={coverUrl}>
      {!minimal &&
        editing && (
          <ActiveStorageProvider
            endpoint={{
              path: `/cases/${slug}`,
              model: 'Case',
              attribute: 'cover_image',
              method: 'PUT',
            }}
            render={({ handleUpload, uploads, ready }) => (
              <FileUploadContainer>
                <HiddenFileUpload
                  onChange={e => handleUpload(e.currentTarget.files)}
                />
                <UploadButton>
                  <FormattedMessage
                    id="case.changeCover"
                    defaultMessage="Change cover image"
                  />
                </UploadButton>
              </FileUploadContainer>
            )}
            onSubmit={({ coverUrl }) => updateCase({ coverUrl })}
          />
        )}

      <h1>
        <span className="c-kicker">
          <EditableText
            value={kicker}
            disabled={!editing || minimal}
            placeholder="Snappy kicker"
            onChange={value => updateCase({ kicker: value })}
          />
        </span>
        <EditableText
          multiline
          value={title}
          disabled={!editing || minimal}
          placeholder="What is the central question of the case?"
          onChange={value => updateCase({ title: value })}
        />
      </h1>

      {!minimal && (
        <AuthorsList
          canEdit={editing}
          byline={{
            authors,
            translators,
            acknowledgements,
          }}
          onChange={(value: Byline) => updateCase(value)}
        />
      )}

      <cite className="o-bottom-right c-photo-credit">
        {!minimal && (
          <EditableText
            value={photoCredit}
            disabled={!editing}
            placeholder={editing ? 'Photo credit' : ''}
            onChange={value => updateCase({ photoCredit: value })}
          />
        )}
      </cite>

      {!minimal && <LibraryLogo library={library} />}
    </CoverImageContainer>
  )
}

export default connect(mapStateToProps, { updateCase })(
  UnconnectedBillboardTitle
)

export const CoverImageContainer = styled.div.attrs({
  className: 'BillboardTitle pt-dark',
})`
  ${({ src }) => css`
    background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)),
      url(${src});
  `};

  ${({ children }) =>
    React.Children.count(children) === 0 &&
    css`
      padding-top: 2em;
    `};
`

const FileUploadContainer = styled.label`
  position: absolute;
  top: 10px;
  right: 10px;
`

const HiddenFileUpload = styled.input.attrs({ type: 'file' })`
  opacity: 0;
  margin: 0;
  min-width: 1em;
`

const UploadButton = styled.span.attrs({
  className: 'pt-button pt-icon-cloud-upload',
})``
