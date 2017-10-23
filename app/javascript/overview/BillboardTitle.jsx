/**
 * @providesModule BillboardTitle
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'

import { EditableText } from '@blueprintjs/core'

import { updateCase } from 'redux/actions'

import LibraryLogo from './LibraryLogo'
import AuthorsList from './AuthorsList'

import type { State, CaseDataState, Byline, Library } from 'redux/state'

function mapStateToProps ({ edit, caseData }: State) {
  const {
    kicker,
    title,
    photoCredit,
    authors,
    authorsString,
    translators,
    translatorsString,
    coverUrl,
    library,
  } = caseData

  return {
    kicker,
    title,
    photoCredit,
    coverUrl,
    authors,
    translators,
    authorsString,
    translatorsString,
    library,
    editing: edit.inProgress,
  }
}

type Props = {
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
  editing,
  kicker,
  title,
  photoCredit,
  authors,
  translators,
  authorsString,
  translatorsString,
  coverUrl,
  updateCase,
  minimal,
  library,
}: Props) => {
  const background = {
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.5)),
      url(${coverUrl})
    `,
  }

  return (
    <div className="BillboardTitle pt-dark" style={background}>
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
            authorsString,
            translatorsString,
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
    </div>
  )
}

export default connect(mapStateToProps, { updateCase })(
  UnconnectedBillboardTitle
)
