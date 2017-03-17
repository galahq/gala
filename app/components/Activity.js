import React from 'react'
import { connect } from 'react-redux'

import Icon from 'Icon.js'
import EditableAttribute from 'EditableAttribute.js'

import { FormattedMessage } from 'react-intl'
import { EditableText } from '@blueprintjs/core'

function mapStateToProps(state, {id}) {
  const activity = state.activitiesById[id]

  return {
    editing: state.edit.inProgress,
    ...activity,
  }
}

const Activity = ({title, pdfUrl, description, editing}) =>
  <article>
    <section className="Page-meta">
      <h2>{title}</h2>
    </section>
    <section>
      <div className="Card pt-dark">
        <h3 className="c-activity__instructions__title">
          <FormattedMessage id="activity-instructions"
            defaultMessage="Instructions" />
        </h3>
        <p className="c-activity__instructions__content">
          <EditableText multiline value={description} disabled={!editing}
            placeholder="Instructions for this activity" />
        </p>
        <EditableAttribute disabled={!editing} title="Download URL"
          value={pdfUrl} style={{maxWidth: "25em" }}/>
      </div>
      <aside className="c-activity__files">
        <figure className="c-activity__file">
          <a href={pdfUrl}>
            <Icon className="c-activity__file__icon" filename="file" />
            <figcaption className="c-activity__file__name">
              {pdfUrl.split('/').slice(-1)}
            </figcaption>
          </a>
        </figure>
      </aside>
    </section>
  </article>

export default connect(mapStateToProps)(Activity)
