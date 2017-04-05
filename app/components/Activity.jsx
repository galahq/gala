import React from 'react'
import { connect } from 'react-redux'

import Icon from 'Icon'
import {EditableText} from '@blueprintjs/core'
import EditableAttribute from 'EditableAttribute'
import CardContents from 'CardContents'

import { FormattedMessage } from 'react-intl'
import { updateActivity } from 'redux/actions'

function mapStateToProps(state, {id}) {
  const activity = state.activitiesById[id]

  return {
    editing: state.edit.inProgress,
    ...activity,
  }
}

const Activity = ({id, title, pdfUrl, cardId, editing, iconSlug, updateActivity,
  deleteElement}) =>
  <article>
    <section className="Page-meta">
      <h1>
        <EditableText placeholder="Activity title" value={title}
          multiline
          disabled={!editing}
          onChange={value => updateActivity(id, { title: value })}
        />
      </h1>
        {editing && <button type="button"
          onClick={deleteElement}
          className="c-delete-element pt-button pt-intent-danger pt-icon-trash">
          Delete Podcast
        </button>}
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
      {
        //<EditableAttribute disabled={!editing} title="Icon Slug"
          //onChange={v => updateActivity(id, {iconSlug: v})}
          //value={iconSlug} />
      }
      <EditableAttribute disabled={!editing} title="Download URL"
        onChange={v => updateActivity(id, {pdfUrl: v})}
        value={pdfUrl} />
    </section>
  </article>

export default connect(mapStateToProps, {updateActivity})(Activity)
