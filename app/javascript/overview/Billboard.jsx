/**
 * @providesModule Billboard
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'

import { FormattedMessage } from 'react-intl'
import { EditableText } from '@blueprintjs/core'

import EditableAttribute from 'utility/EditableAttribute'
import Less from 'utility/Less'
import BillboardTitle from './BillboardTitle'
import CommunityChooser from './CommunityChooser'
import LearningObjectives from './LearningObjectives'

import { updateCase } from 'redux/actions'

import type { State } from 'redux/state'

function mapStateToProps (state: State) {
  const { edit, caseData } = state
  const {
    slug,
    dek,
    summary,
    baseCoverUrl,
    otherAvailableLocales,
    learningObjectives,
  } = caseData
  return {
    editing: edit.inProgress,
    slug,
    dek,
    summary,
    baseCoverUrl,
    otherAvailableLocales,
    learningObjectives,
  }
}

type Props = {
  editing: boolean,
  slug: string,
  dek: string,
  summary: string,
  baseCoverUrl: string,
  updateCase: typeof updateCase,
  otherAvailableLocales: string[],
  learningObjectives: string[],
}

const Billboard = ({
  editing,
  slug,
  dek,
  summary,
  baseCoverUrl,
  updateCase,
  otherAvailableLocales,
  learningObjectives,
}: Props) =>
  <section className="Billboard">
    <BillboardTitle />
    <CommunityChooser />
    <EditableAttribute
      disabled={!editing}
      title="Base cover image URL"
      value={baseCoverUrl}
      style={{ color: '#EBEAE4' }}
      onChange={v => updateCase({ baseCoverUrl: v, coverUrl: v })}
    />
    <div className="Card BillboardSnippet pt-light">
      <p className="c-BillboardSnippet__dek">
        <EditableText
          multiline
          value={dek}
          disabled={!editing}
          placeholder="In one concise sentence, provide background and an intriguing twist: get a student to read this case."
          onChange={value => {
            updateCase({ dek: value })
          }}
        />
      </p>

      <Less
        startOpen={!learningObjectives}
        disabled={!learningObjectives || editing}
      >
        <p style={{ margin: 0 }}>
          <EditableText
            multiline
            value={summary}
            disabled={!editing}
            placeholder="Summarize the case in a short paragraph."
            onChange={value => updateCase({ summary: value })}
          />
        </p>
      </Less>

      {(learningObjectives || editing) &&
        <LearningObjectives
          disabled={!editing}
          learningObjectives={learningObjectives}
          onChange={value => updateCase({ learningObjectives: value })}
        />}

      <FlagLinks languages={otherAvailableLocales} slug={slug} />
    </div>
  </section>

export default connect(mapStateToProps, { updateCase })(Billboard)

type FlagLinksProps = { slug: string, languages: string[] }
function FlagLinks ({ slug, languages }: FlagLinksProps) {
  if (languages.length > 0) {
    return (
      <div className="flag-links">
        <FormattedMessage id="overview.otherLanguages" />
        <br />
        {languages.map(lx => <FlagLink key={lx} lx={lx} slug={slug} />)}
      </div>
    )
  }
  return <span />
}

type FlagLinkProps = { slug: string, lx: string }
function FlagLink ({ slug, lx }: FlagLinkProps) {
  return (
    <a href={`/${lx}/cases/${slug}`}>
      <span
        className="flag-links__icon"
        dangerouslySetInnerHTML={{
          __html: require(`images/flag-${lx}.svg`),
        }}
      />
      &nbsp;
      <FormattedMessage id={lx} />
    </a>
  )
}
