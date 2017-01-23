import React from 'react'
import { connect } from 'react-redux'

import { EditableText } from '@blueprintjs/core'

import BillboardTitle from 'BillboardTitle.js'
import { I18n } from 'I18n.js'
import { updateCase } from 'redux/actions.js'

function mapStateToProps(state) {
  let { edit, caseData } = state
  let { slug, dek, summary, baseCoverUrl, otherAvailableLocales } = caseData
  return {
    slug, dek, summary, baseCoverUrl, otherAvailableLocales,
    editing: edit.inProgress,
  }
}

const Billboard = ({
  editing, slug, dek, summary, baseCoverUrl, updateCase, otherAvailableLocales,
}) => <section className="Billboard">
    <BillboardTitle />
    {
      //<div><EditableAttribute placeholder="Base cover image URL"
          //uri={`${endpoint}:cover_url`} didSave={didSave}>{baseCoverUrl}</EditableAttribute></div>
    }
    <div className="Card BillboardSnippet pt-light">
      <h3>
        <EditableText multiline value={dek} disabled={!editing}
          placeholder="In one concise sentence, provide background and an intriguing twist: get a student to read this case."
          onChange={value => updateCase(slug, {dek: value})}
        />
      </h3>
      <p>
        <EditableText multiline value={summary} disabled={!editing}
          placeholder="Summarize the case in a short paragraph."
          onChange={value => updateCase(slug, {summary: value})}
        />
      </p>
      <FlagLinks languages={otherAvailableLocales} slug={slug} />
    </div>
  </section>

export default connect(
  mapStateToProps,
  { updateCase },
)(Billboard)


const FlagLinks = ({ languages, slug }) => languages.length > 0
? <div
    className="flag-links">
    <I18n meaning="other-languages" />
    <br />
    {languages.map( lx => <FlagLink key={lx} lx={lx} slug={slug} /> )}
  </div>
: <span />


const FlagLink = ({ slug, lx }) => <a href={`/${lx}/cases/${slug}`}>
  <span className="flag-links__icon" dangerouslySetInnerHTML={{__html: require(`../assets/images/react/flag-${lx}.svg`)}} />
  &nbsp;
  <I18n meaning={lx} />
</a>
