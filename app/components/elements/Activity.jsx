// @flow

import React from 'react';
import { connect } from 'react-redux';

import { FormattedMessage } from 'react-intl';
import { EditableText } from '@blueprintjs/core';

import Icon from 'utility/Icon';
import EditableAttribute from 'utility/EditableAttribute';
import Card from 'card';

import { updateActivity } from 'redux/actions';

import type { State } from 'redux/state';

type OwnProps = { id: number };
function mapStateToProps(state: State, { id }: OwnProps) {
  const activity = state.activitiesById[id];

  return {
    editing: state.edit.inProgress,
    ...activity,
  };
}

const Activity = (
  {
    id,
    title,
    pdfUrl,
    cardId,
    editing,
    iconSlug = 'activity-text',
    updateActivity,
    deleteElement,
  },
) => (
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
      {editing &&
        <button
          type="button"
          className="c-delete-element pt-button pt-intent-danger pt-icon-trash"
          onClick={deleteElement}
        >
          Delete Podcast
        </button>}
    </section>

    <section>
      <Card
        nonNarrative
        id={cardId}
        title={
          <h3 className="c-activity__instructions__title">
            <FormattedMessage
              id="activity-instructions"
              defaultMessage="Instructions"
            />
          </h3>
        }
      />
      <aside className="c-activity__files">
        <figure className="c-activity__file">
          <a href={pdfUrl}>
            <Icon className="c-activity__file__icon" filename={iconSlug} />
            <figcaption className="c-activity__file__name">
              <FormattedMessage
                id="activity-download"
                defaultMessage="Download"
              />
            </figcaption>
          </a>
        </figure>
      </aside>
    </section>

    <section className="c-activity__attributes pt-dark">
      {// <EditableAttribute disabled={!editing} title="Icon Slug"
      // onChange={v => updateActivity(id, {iconSlug: v})}
      // value={iconSlug} />}
      <EditableAttribute
        disabled={!editing}
        title="Download URL"
        value={pdfUrl}
        onChange={v => updateActivity(id, { pdfUrl: v })}
      />
    </section>
  </article>
);

export default connect(mapStateToProps, { updateActivity })(Activity);
