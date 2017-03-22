import React from 'react'
import { connect } from 'react-redux'

import Icon from 'Icon.js'
import EditableAttribute from 'EditableAttribute.js'
import CardContents from 'CardContents.js'

import { FormattedMessage } from 'react-intl'

function mapStateToProps(state, {id}) {
  const activity = state.activitiesById[id]

  return {
    editing: state.edit.inProgress,
    ...activity,
  }
}

const Activity = ({title, pdfUrl, cardId, editing, iconSlug}) =>
  <article>
    <section className="Page-meta">
      <h2>{title}</h2>
    </section>
    <section>
      <CardContents id={cardId} nonNarrative title={
        <h3 className="c-activity__instructions__title">
          <FormattedMessage id="activity-instructions"
            defaultMessage="Instructions" />
        </h3>
      } />
      <aside className="c-activity__files">
        <figure className="c-activity__file">
          <a href={pdfUrl}>
            <Icon className="c-activity__file__icon"
              filename={iconSlug || 'activity-text'} />
            <figcaption className="c-activity__file__name">
              <FormattedMessage id="activity-download"
                defaultMessage="Download" />
            </figcaption>
          </a>
        </figure>
      </aside>
    </section>
    <section className="c-activity__attributes pt-dark">
      <EditableAttribute disabled={!editing} title="Icon Slug"
        value={iconSlug} />
      <EditableAttribute disabled={!editing} title="Download URL"
        value={pdfUrl} />
    </section>
  </article>

export default connect(mapStateToProps)(Activity)
