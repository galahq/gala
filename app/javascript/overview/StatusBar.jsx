/**
 * @providesModule StatusBar
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import { toggleEditing, saveChanges, togglePublished } from 'redux/actions'

import Toolbar from 'utility/Toolbar'

import type { ContextRouter } from 'react-router-dom'
import type { State } from 'redux/state'

function mapStateToProps (state: State, { location, history }: ContextRouter) {
  let { edit, caseData } = state
  let { inProgress } = edit
  let { commentable, links, publishedAt, reader } = caseData
  let { pathname } = location
  return {
    editable: edit.possible,
    editing: inProgress,
    edited: edit.changed,
    published: !!publishedAt,
    links,
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
  links,
  toggleEditing,
  togglePublished,
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
          icon: 'home',
          onClick: () =>
            (window.location = window.location.pathname.replace(
              /cases.*/,
              ''
            )),
        },
        {
          disabled: !commentable || !reader || !reader.enrollment,
          message: 'comments.index.conversation',
          icon: 'chat',
          onClick: () => history.push('/conversation'),
        },
      ]
      : [
        {
          message: 'cases.show.backToOverview',
          icon: 'arrow-left',
          onClick: () => history.push('/'),
        },
      ],
    [
      editing
        ? { message: 'cases.edit.justChangeTheText' }
        : !published
          ? { message: 'cases.show.notYetPublished' }
          : null,
    ],
    [
      editing || {
        message: 'deployments.new.teachThisCase',
        icon: 'follower',
        onClick: () => (window.location = links.teach),
      },

      editable &&
        (edited
          ? {
            disabled: !edited,
            message: 'cases.edit.save',
            icon: 'floppy-disk',
            onClick: saveChanges,
          }
          : {
            message: editing ? 'cases.edit.stopEditing' : 'cases.edit.edit',
            icon: editing ? 'cross' : 'edit',
            onClick: toggleEditing,
          }),

      editable && {
        message: 'cases.edit.options',
        icon: 'cog',
        submenu: [
          edited
            ? null
            : {
              message: 'cases.settings.edit.editCaseSettings',
              icon: 'settings',
              onClick: () => {
                window.location = links.settings
              },
            },
          editing || edited
            ? null
            : {
              message: published
                ? 'cases.edit.unpublishCase'
                : 'cases.edit.publishCase',
              icon: published ? 'lock' : 'upload',
              onClick: togglePublished,
            },
        ],
      },
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
  })(StatusBar)
)
