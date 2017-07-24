/**
 * @providesModule BillboardTitle
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'

import { EditableText } from '@blueprintjs/core'

import { updateCase } from 'redux/actions'

import type { State, CaseDataState } from 'redux/state'

function mapStateToProps ({ edit, caseData }: State) {
  const {
    slug,
    kicker,
    title,
    photoCredit,
    caseAuthors,
    translators,
    coverUrl,
  } = caseData

  return {
    slug,
    kicker,
    title,
    photoCredit,
    caseAuthors,
    translators,
    coverUrl,
    editing: edit.inProgress,
  }
}

type Props = {
  editing: boolean,
  slug: string,
  kicker: string,
  title: string,
  photoCredit: string,
  caseAuthors: string,
  translators: string,
  coverUrl: string,
  updateCase: (string, $Shape<CaseDataState>) => void,
  minimal: boolean,
}
export const UnconnectedBillboardTitle = ({
  editing,
  slug,
  kicker,
  title,
  photoCredit,
  caseAuthors,
  translators,
  coverUrl,
  updateCase,
  minimal,
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
            onChange={value => updateCase(slug, { kicker: value })}
          />
        </span>
        <EditableText
          multiline
          value={title}
          disabled={!editing || minimal}
          placeholder="What is the central question of the case?"
          onChange={value => updateCase(slug, { title: value })}
        />
      </h1>

      {!minimal &&
        caseAuthors !== '' &&
        <p>
          {caseAuthors}
          <br />
          {translators !== '' &&
            <em>
              {translators}
            </em>}
        </p>}

      <cite className="o-bottom-right c-photo-credit">
        {minimal ||
          <EditableText
            value={photoCredit}
            disabled={!editing}
            placeholder={editing ? 'Photo credit' : ''}
            onChange={value => updateCase(slug, { photoCredit: value })}
          />}
      </cite>
    </div>
  )
}

export default connect(mapStateToProps, { updateCase })(
  UnconnectedBillboardTitle
)
