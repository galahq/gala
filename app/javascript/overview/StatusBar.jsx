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
  let { publishedAt } = caseData
  let { pathname } = location
  return {
    editable: edit.possible,
    editing: inProgress,
    edited: edit.changed,
    published: !!publishedAt,
    pathname,
    history,
  }
}

function StatusBar ({
  editable,
  editing,
  edited,
  published,
  toggleEditing,
  togglePublished,
  saveChanges,
  pathname,
  history,
}) {
  const groups = [
    [
      pathname === '/'
        ? {
          message: 'catalog',
          iconName: 'home',
          onClick: () => (window.location = '/'),
        }
        : {
          message: 'case.backToOverview',
          iconName: 'arrow-left',
          onClick: () => history.push('/'),
        },
    ],
    [
      editing
        ? { message: 'statusBar.editInstructions' }
        : !published ? { message: 'statusBar.betaNotification' } : null,
    ],
    [
      editable
        ? {
          message: 'statusBar.options',
          iconName: 'cog',
          submenu: [
            editing || edited
                ? {
                  disabled: !edited,
                  message: 'statusBar.save',
                  iconName: 'floppy-disk',
                  onClick: saveChanges,
                }
                : {
                  message: published
                      ? 'statusBar.unpublishCase'
                      : 'statusBar.publishCase',
                  iconName: published ? 'lock' : 'upload',
                  onClick: togglePublished,
                },
            {
              message: editing ? 'statusBar.endEdit' : 'statusBar.beginEdit',
              iconName: editing ? 'cross' : 'edit',
              onClick: toggleEditing,
            },
          ],
        }
        : null,
    ],
  ]

  if (!groups.some(x => x)) return null

  return <Toolbar groups={groups} light={editing} />
}

export default withRouter(
  connect(mapStateToProps, {
    toggleEditing,
    saveChanges,
    togglePublished,
  })(StatusBar)
)
