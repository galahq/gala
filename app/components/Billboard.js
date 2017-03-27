import React from 'react'
import { connect } from 'react-redux'

import { EditableText } from '@blueprintjs/core'
import EditableAttribute from 'EditableAttribute.js'

import BillboardTitle from 'BillboardTitle.js'
import { FormattedMessage } from 'react-intl'
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
    <EditableAttribute disabled={!editing} title="Base cover image URL"
      onChange={v => updateCase(slug, {baseCoverUrl: v, coverUrl: v})}
      value={baseCoverUrl} style={{color: '#EBEAE4'}}
    />
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
    <FormattedMessage id="overview.otherLanguages" />
    <br />
    {languages.map( lx => <FlagLink key={lx} lx={lx} slug={slug} /> )}
  </div>
: <span />


const FlagLink = ({ slug, lx }) => <a href={`/${lx}/cases/${slug}`}>
  <span className="flag-links__icon" dangerouslySetInnerHTML={{__html: require(`../assets/images/react/flag-${lx}.svg`)}} />
  &nbsp;
  <FormattedMessage id={lx} />
</a>
