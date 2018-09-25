/**
 * @providesModule BillboardTitle
 * @flow
 */

import React from 'react'
import styled, { css } from 'styled-components'
import { connect } from 'react-redux'

import ActiveStorageProvider from 'react-activestorage-provider'
import { EditableText } from '@blueprintjs/core'

import { updateCase } from 'redux/actions'

import LibraryLogo from './LibraryLogo'
import AuthorsList from './AuthorsList'
import { PositionedFileUploadWidget } from 'utility/FileUploadWidget'

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
    links,
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
    links,
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
  updateCase: typeof updateCase,
  minimal?: boolean,
  library: Library,
  links: $PropertyType<CaseDataState, 'links'>,
  onBeginEditing?: () => void,
  onFinishEditing?: () => void,
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
  links,
  onBeginEditing,
  onFinishEditing,
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
          render={renderProps => (
            <PositionedFileUploadWidget
              message={{ id: 'cases.edit.changeCoverImage' }}
              {...renderProps}
            />
          )}
          onSubmit={({ coverUrl }: CaseDataState) =>
            updateCase({ coverUrl }, false)
          }
        />
      )}

      <h1>
        <span className="c-kicker">
          <EditableText
            className="pt-multiline"
            value={kicker}
            disabled={!editing || minimal}
            placeholder="Snappy kicker"
            onChange={value => updateCase({ kicker: value })}
            onEdit={onBeginEditing}
            onCancel={onFinishEditing}
            onConfirm={onFinishEditing}
          />
        </span>
        <EditableText
          multiline
          value={title}
          disabled={!editing || minimal}
          placeholder="What is the central question of the case?"
          onChange={value => updateCase({ title: value })}
          onEdit={onBeginEditing}
          onCancel={onFinishEditing}
          onConfirm={onFinishEditing}
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
          onStartEditing={onBeginEditing}
          onFinishEditing={onFinishEditing}
        />
      )}

      <cite className="o-bottom-right c-photo-credit">
        {!minimal && (
          <EditableText
            multiline
            value={photoCredit}
            disabled={!editing}
            placeholder={editing ? 'Photo credit' : ''}
            onChange={value => updateCase({ photoCredit: value })}
            onEdit={onBeginEditing}
            onCancel={onFinishEditing}
            onConfirm={onFinishEditing}
          />
        )}
      </cite>

      {!minimal && (
        <LibraryLogo
          library={library}
          href={editing ? links.settings : undefined}
        />
      )}
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
