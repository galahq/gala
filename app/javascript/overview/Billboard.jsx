/**
 * @providesModule Billboard
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import { EditableText } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'

import Lock from 'utility/Lock'
import Less from 'utility/Less'
import BillboardTitle from './BillboardTitle'
import LearningObjectives from './LearningObjectives'
import CaseKeywords from './CaseKeywords'
import TranslationLinks from './TranslationLinks'
import TeachingGuide from './TeachingGuide'

import asyncComponent from 'utility/asyncComponent'
import { updateCase } from 'redux/actions'

import type { State, Case, Tag, Viewport, WikidataLink } from 'redux/state'
import LinkWikidata from '../wikidata/LinkWikidata'

const MapView = asyncComponent(() => import('map_view').then(m => m.default))

function mapStateToProps ({ caseData, edit }: State) {
  const {
    baseCoverUrl,
    dek,
    learningObjectives,
    otherAvailableLocales,
    reader,
    slug,
    summary,
    tags,
    links,
    teachingGuideUrl,
    wikidataLinks,
  } = caseData

  return {
    baseCoverUrl,
    caseData,
    dek,
    editing: edit.inProgress,
    learningObjectives,
    otherAvailableLocales,
    readerSignedIn: !!reader,
    slug,
    summary,
    taggingsPath: links.taggings,
    tags,
    teachingGuideUrl,
    wikidataLinks,
  }
}

type Props = {
  baseCoverUrl: string,
  caseData: Case,
  dek: string,
  editing: boolean,
  learningObjectives: string[],
  otherAvailableLocales: $PropertyType<Case, 'otherAvailableLocales'>,
  readerSignedIn: boolean,
  slug: string,
  summary: string,
  taggingsPath: string,
  tags: Tag[],
  teachingGuideUrl: string,
  wikidataLinks: WikidataLink,
  updateCase: typeof updateCase,
}

const Billboard = ({
  baseCoverUrl,
  caseData,
  dek,
  editing,
  learningObjectives,
  otherAvailableLocales,
  readerSignedIn,
  slug,
  summary,
  taggingsPath,
  tags,
  teachingGuideUrl,
  wikidataLinks,
  updateCase,
}: Props) => {
  console.log("Billboard, caseData: ", caseData)
  return (
  <Container>
    <Lock type="Case" param={slug}>
      {({ onBeginEditing, onFinishEditing }) => (
        <>
          <BillboardTitle
            onBeginEditing={onBeginEditing}
            onFinishEditing={onFinishEditing}
          />

          <Card>
            <Dek>
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
            </Dek>

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
          </Card>

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

          <LinkWikidata
            editing={editing}
            wikidataLinks={caseData.wikidataLinks}
            caseData={caseData}
            onChange={(wikidataLinks: WikidataLink[]) => updateCase({ wikidataLinks })}
          />

          {readerSignedIn && (
            <MinimalLink href={caseData.links.archive}>
              <FormattedMessage id="archives.show.printableArchive" />
            </MinimalLink>
          )}

          <MinimalLink
            href={caseData.licenseConfig.url}
            target='_blank'
          >
            {caseData.licenseConfig.name}
          </MinimalLink>
        </>
      )}
    </Lock>
  </Container>
)
}

// $FlowFixMe
export default connect(
  mapStateToProps,
  { updateCase }
)(Billboard)

// $FlowFixMe
export const Container = styled.section.attrs({ className: 'Billboard' })`
  position: relative;
`

const Card = styled.div.attrs({ className: 'Card' })`
  border-top: 4px solid #6acb72;
  border-radius: 0 0 3px 3px;

  @media (max-width: 513px) {
    padding: 20px;
  }
`

const Dek = styled.h3`
  font-family: ${p => p.theme.sansFont};
  font-size: 20px;
  font-weight: 500;
  line-height: 25px;
  margin: 20px 0;

  @media (max-width: 513px) {
    margin: 5px 0 15px;
    font-size: 18px;
    line-height: 21px;
  }
`

const MinimalLink = styled.a`
  color: #c8dbef;
  font-size: 14px;
  padding: 10px;

  &:hover {
    color: white;
  }
`
