/**
 * @providesModule BillboardTitle
 * @flow
 */

import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import ActiveStorageProvider from 'react-activestorage-provider'
import { EditableText } from '@blueprintjs/core'

import { updateCase, displayErrorToast } from 'redux/actions'
import { formatErrors } from 'shared/orchard'

import LibraryLogo from './LibraryLogo'
import AuthorsList from './AuthorsList'
import { PositionedFileUploadWidget } from 'utility/FileUploadWidget'
import * as TitleCard from 'shared/TitleCard'
import { Container as SidebarContainer } from 'elements/Sidebar'

import type { State, CaseDataState, Byline, Library } from 'redux/state'

function mapStateToProps({ edit, caseData }: State) {
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
  displayErrorToast: typeof displayErrorToast,
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
  displayErrorToast,
}: Props) => {
  return (
    <Container>
      <TitleCard.Container>
        <TitleCard.Image src={coverUrl}>
          {!minimal && editing && (
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
              onError={error => {
                error
                  .json()
                  .then(formatErrors)
                  .then(displayErrorToast)
              }}
            />
          )}

          <TitleCard.PhotoCredit>
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
          </TitleCard.PhotoCredit>
        </TitleCard.Image>

        <TitleCard.Title>
          <TitleCard.Kicker>
            <EditableText
              multiline
              value={kicker}
              disabled={!editing || minimal}
              placeholder="Short Title"
              onChange={value => updateCase({ kicker: value })}
              onEdit={onBeginEditing}
              onCancel={onFinishEditing}
              onConfirm={onFinishEditing}
            />
          </TitleCard.Kicker>

          <TitleCard.Question>
            <EditableText
              multiline
              value={title}
              disabled={!editing || minimal}
              placeholder="What is the central question of the module?"
              onChange={value => updateCase({ title: value })}
              onEdit={onBeginEditing}
              onCancel={onFinishEditing}
              onConfirm={onFinishEditing}
            />
          </TitleCard.Question>
        </TitleCard.Title>

        <TitleCard.Authors>
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
        </TitleCard.Authors>

        {!minimal && !editing && <LibraryLogo library={library} />}
      </TitleCard.Container>
    </Container>
  )
}

// $FlowFixMe
export default connect(mapStateToProps, { updateCase, displayErrorToast })(
  UnconnectedBillboardTitle
)

export const Container = styled.div`
  display: grid;
  min-height: 300px;

  ${SidebarContainer} & {
    margin-bottom: 1em;
    min-height: unset;
  }
`
