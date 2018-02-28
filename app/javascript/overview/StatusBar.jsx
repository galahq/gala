/**
 * @providesModule StatusBar
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import {
  toggleEditing,
  saveChanges,
  togglePublished,
  toggleFeatured,
} from 'redux/actions'

import Toolbar from 'utility/Toolbar'

import type { ContextRouter } from 'react-router-dom'
import type { State } from 'redux/state'

function mapStateToProps (state: State, { location, history }: ContextRouter) {
  let { edit, caseData } = state
  let { inProgress } = edit
  let { commentable, publishedAt, featuredAt, reader } = caseData
  let { pathname } = location
  return {
    editable: edit.possible,
    editing: inProgress,
    edited: edit.changed,
    published: !!publishedAt,
    featured: !!featuredAt,
    commentable,
    pathname,
    history,
    reader,
  }
}

function StatusBar ({
  commentable,
  editable,
  editing,
  edited,
  published,
  featured,
  toggleEditing,
  togglePublished,
  toggleFeatured,
  saveChanges,
  pathname,
  history,
  reader,
}) {
  const groups = [
    pathname === '/'
      ? [
        {
          message: 'catalog.catalog',
          iconName: 'home',
          onClick: () =>
            (window.location = window.location.pathname.replace(
              /cases.*/,
              ''
            )),
        },
        {
          disabled: !commentable || !reader || !reader.enrollment,
          message: 'comments.index.conversation',
          iconName: 'chat',
          onClick: () => history.push('/conversation'),
        },
      ]
      : [
        {
          message: 'cases.show.backToOverview',
          iconName: 'arrow-left',
          onClick: () => history.push('/'),
        },
      ],
    [
      editing
        ? { message: 'cases.edit.justChangeTheText' }
        : !published ? { message: 'cases.show.notYetPublished' } : null,
    ],
    [
      editable
        ? {
          message: 'cases.edit.options',
          iconName: 'cog',
          submenu: [
            editing || edited
              ? {
                disabled: !edited,
                message: 'cases.edit.save',
                iconName: 'floppy-disk',
                onClick: saveChanges,
              }
              : {
                message: published
                  ? 'cases.edit.unpublishCase'
                  : 'cases.edit.publishCase',
                iconName: published ? 'lock' : 'upload',
                onClick: togglePublished,
              },
            published && !edited
              ? {
                message: featured
                  ? 'cases.edit.unfeatureCase'
                  : 'cases.edit.featureCase',
                iconName: featured ? 'star-empty' : 'star',
                onClick: toggleFeatured,
              }
              : null,
            {
              message: editing ? 'cases.edit.stopEditing' : 'cases.edit.edit',
              iconName: editing ? 'cross' : 'edit',
              onClick: toggleEditing,
            },
          ],
        }
        : null,
    ],
  ]

  if (!groups.some(x => x)) return null

  return <Toolbar canBeIconsOnly groups={groups} light={editing} />
}

export default withRouter(
  connect(mapStateToProps, {
    toggleEditing,
    saveChanges,
    togglePublished,
    toggleFeatured,
  })(StatusBar)
)
