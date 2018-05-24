/**
 * @providesModule Billboard
 * @flow
 */

import React, { Fragment } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import { FormattedMessage } from 'react-intl'
import { EditableText } from '@blueprintjs/core'

import Lock from 'utility/Lock'
import Less from 'utility/Less'
import BillboardTitle from './BillboardTitle'
import CommunityChooser from './CommunityChooser'
import LearningObjectives from './LearningObjectives'
import MapView from 'catalog/MapView'

import { updateCase } from 'redux/actions'

import type { State, Case, Viewport } from 'redux/state'

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
    caseData,
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
  caseData: Case,
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
  caseData,
}: Props) => (
  <Container>
    <Lock type="Case" param={slug}>
      {({ onBeginEditing, onFinishEditing }) => (
        <Fragment>
          <BillboardTitle
            onBeginEditing={onBeginEditing}
            onFinishEditing={onFinishEditing}
          />
          {editing || <CommunityChooser />}

          <div className="Card BillboardSnippet pt-light">
            <h3 className="c-BillboardSnippet__dek">
              <EditableText
                multiline
                value={dek}
                disabled={!editing}
                placeholder="In one concise sentence, provide background and an intriguing twist: get a student to read this case."
                onChange={value => {
                  updateCase({ dek: value })
                }}
                onEdit={onBeginEditing}
                onCancel={onFinishEditing}
                onConfirm={onFinishEditing}
              />
            </h3>

            <Less
              startOpen={!summary || summary.length < 500}
              disabled={editing}
            >
              <div style={{ margin: 0 }}>
                <EditableText
                  multiline
                  value={summary}
                  disabled={!editing}
                  placeholder="Summarize the case in a short paragraph."
                  onChange={value => updateCase({ summary: value })}
                  onEdit={onBeginEditing}
                  onCancel={onFinishEditing}
                  onConfirm={onFinishEditing}
                />
              </div>
            </Less>

            {(learningObjectives || editing) && (
              <LearningObjectives
                disabled={!editing}
                learningObjectives={learningObjectives}
                onChange={value => {
                  updateCase({ learningObjectives: value })
                  onBeginEditing()
                }}
                onStopChanging={onFinishEditing}
              />
            )}

            <FlagLinks languages={otherAvailableLocales} slug={slug} />
          </div>

          {(caseData.latitude || editing) && (
            <MapView
              cases={[caseData]}
              editing={editing}
              height={300}
              startingViewport={{
                latitude: caseData.latitude || 0,
                longitude: caseData.longitude || 0,
                zoom: caseData.zoom || 1,
              }}
              title={{ id: 'activerecord.attributes.case.location' }}
              onBeginEditing={onBeginEditing}
              onChangeViewport={(viewport: Viewport) => updateCase(viewport)}
              onFinishEditing={onFinishEditing}
            />
          )}
        </Fragment>
      )}
    </Lock>
  </Container>
)

export default connect(mapStateToProps, { updateCase })(Billboard)

const Container = styled.section.attrs({ className: 'Billboard' })`
  position: relative;
`

type FlagLinksProps = { slug: string, languages: string[] }
function FlagLinks ({ slug, languages }: FlagLinksProps) {
  if (languages.length > 0) {
    return (
      <div className="flag-links">
        <FormattedMessage id="cases.show.otherLanguages" />
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
      <FormattedMessage id={`support.languages.${lx}`} />
    </a>
  )
}
