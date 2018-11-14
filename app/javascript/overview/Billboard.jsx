/**
 * @providesModule Billboard
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import { EditableText } from '@blueprintjs/core'

import Lock from 'utility/Lock'
import Less from 'utility/Less'
import BillboardTitle from './BillboardTitle'
import CommunityChooser from './CommunityChooser'
import LearningObjectives from './LearningObjectives'
import CaseKeywords from './CaseKeywords'
import TranslationLinks from './TranslationLinks'
import TeachingGuide from './TeachingGuide'

import asyncComponent from 'utility/asyncComponent'
import { updateCase } from 'redux/actions'

import type { State, Case, Tag, Viewport } from 'redux/state'

const MapView = asyncComponent(() =>
  import('map_view').then(m => m.default)
)

function mapStateToProps ({ edit, caseData }: State) {
  const {
    baseCoverUrl,
    dek,
    learningObjectives,
    otherAvailableLocales,
    slug,
    summary,
    tags,
    links,
    teachingGuideUrl,
  } = caseData

  return {
    baseCoverUrl,
    caseData,
    dek,
    editing: edit.inProgress,
    learningObjectives,
    otherAvailableLocales,
    slug,
    summary,
    taggingsPath: links.taggings,
    tags,
    teachingGuideUrl,
  }
}

type Props = {
  baseCoverUrl: string,
  caseData: Case,
  dek: string,
  editing: boolean,
  learningObjectives: string[],
  otherAvailableLocales: $PropertyType<Case, 'otherAvailableLocales'>,
  slug: string,
  summary: string,
  taggingsPath: string,
  tags: Tag[],
  teachingGuideUrl: string,
  updateCase: typeof updateCase,
}

const Billboard = ({
  baseCoverUrl,
  caseData,
  dek,
  editing,
  learningObjectives,
  otherAvailableLocales,
  slug,
  summary,
  taggingsPath,
  tags,
  teachingGuideUrl,
  updateCase,
}: Props) => (
  <Container>
    <Lock type="Case" param={slug}>
      {({ onBeginEditing, onFinishEditing }) => (
        <>
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

            <LearningObjectives
              editing={editing}
              learningObjectives={learningObjectives}
              onChange={value => {
                updateCase({ learningObjectives: value })
                onBeginEditing()
              }}
              onStopChanging={onFinishEditing}
            />

            <TeachingGuide />

            <TranslationLinks languages={otherAvailableLocales} />
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
              onViewportChange={(viewport: Viewport) => updateCase(viewport)}
              onFinishEditing={onFinishEditing}
            />
          )}

          <CaseKeywords
            editing={editing}
            key={taggingsPath}
            taggingsPath={taggingsPath}
            tags={tags}
            onChange={(tags: Tag[]) => updateCase({ tags })}
          />
        </>
      )}
    </Lock>
  </Container>
)

export default connect(
  mapStateToProps,
  { updateCase }
)(Billboard)

export const Container = styled.section.attrs({ className: 'Billboard' })`
  position: relative;
`
