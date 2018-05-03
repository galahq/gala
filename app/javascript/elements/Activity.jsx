/**
 * @providesModule Activity
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'

import ActiveStorageProvider from 'react-activestorage-provider'
import { FormattedMessage } from 'react-intl'
import { EditableText } from '@blueprintjs/core'

import Icon from 'utility/Icon'
import EditableAttribute from 'utility/EditableAttribute'
import Card from 'card'
import FileUploadWidget from 'utility/FileUploadWidget'

import { updateActivity } from 'redux/actions'

import type { State, ActivityT } from 'redux/state'

type OwnProps = { id: number }
function mapStateToProps (state: State, { id }: OwnProps) {
  const activity = state.activitiesById[`${id}`]

  return {
    editing: state.edit.inProgress,
    ...activity,
  }
}

const Activity = ({
  id,
  title,
  pdfUrl,
  cardId,
  editing,
  iconSlug = 'activity-text',
  updateActivity,
  deleteElement,
}) => (
  <article>
    <section className="Page-meta">
      <h1>
        <EditableText
          multiline
          placeholder="Activity title"
          value={title}
          disabled={!editing}
          onChange={value => updateActivity(id, { title: value })}
        />
      </h1>
      {editing && (
        <button
          type="button"
          className="c-delete-element pt-button pt-intent-danger pt-icon-trash"
          onClick={deleteElement}
        >
          <FormattedMessage id="activities.edit.deleteActivity" />
        </button>
      )}
    </section>

    <section>
      <Card
        nonNarrative
        id={cardId}
        title={
          <h3 className="c-activity__instructions__title">
            <FormattedMessage id="activities.show.instructions" />
          </h3>
        }
      />
      <aside className="c-activity__files">
        <figure className="c-activity__file">
          {pdfUrl != null && (
            <a href={pdfUrl}>
              <Icon className="c-activity__file__icon" filename={iconSlug} />
              <figcaption className="c-activity__file__name">
                <FormattedMessage id="activities.show.download" />
              </figcaption>
            </a>
          )}

          {editing && (
            <ActiveStorageProvider
              endpoint={{
                path: `/activities/${id}`,
                model: 'Activity',
                attribute: 'pdf',
                method: 'PUT',
              }}
              render={renderProps => (
                <FileUploadWidget
                  accept=""
                  message={{ id: 'activities.edit.uploadAttachment' }}
                  {...renderProps}
                />
              )}
              onSubmit={({ pdfUrl }: ActivityT) =>
                updateActivity(`${id}`, { pdfUrl }, false)
              }
            />
          )}
        </figure>
      </aside>
    </section>
  </article>
)

export default connect(mapStateToProps, { updateActivity })(Activity)
