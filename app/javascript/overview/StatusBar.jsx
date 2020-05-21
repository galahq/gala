/**
 * @providesModule StatusBar
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import { toggleEditing, saveChanges, togglePublished } from 'redux/actions'

import Toolbar from 'utility/Toolbar'
import { Consumer as ContentItemSelectionContextConsumer } from 'deployment/contentItemSelectionContext'

import type { ContextRouter } from 'react-router-dom'
import type { State } from 'redux/state'

function mapStateToProps (state: State, { location, history }: ContextRouter) {
  const { edit, caseData } = state
  const { inProgress } = edit
  const { commentable, links, publishedAt, reader, slug } = caseData
  const { pathname } = location
  const activeCommunity = reader?.activeCommunity

  const caselogSpotlightNeeded =
    activeCommunity?.name === 'CaseLog' && publishedAt != null

  return {
    editable: edit.possible,
    editing: inProgress,
    edited: edit.changed,
    published: !!publishedAt,
    caseSlug: slug,
    caselogSpotlightNeeded,
    links,
    commentable,
    pathname,
    history,
    reader,
  }
}

function StatusBar ({
  caselogSpotlightNeeded,
  caseSlug,
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
  console.log({ reader })
  return (
    <ContentItemSelectionContextConsumer>
      {({ selecting, onSelect }) => {
        const groups = [
          [
            pathname === '/'
              ? {
                  message: 'catalog.catalog',
                  icon: 'home',
                  onClick: () =>
                    (window.location = window.location.pathname.replace(
                      /cases.*/,
                      ''
                    )),
                }
              : {
                  message: 'cases.show.backToOverview',
                  icon: 'arrow-left',
                  onClick: () => history.push('/'),
                },

            !pathname.startsWith('/conversation') && {
              disabled: !commentable || !reader || !reader.enrollment,
              message: 'comments.index.conversation',
              icon: 'chat',
              onClick: () => history.push('/conversation'),
              spotlightKey: caselogSpotlightNeeded
                ? reader.persona === 'writer' && editable
                  ? 'first-caselog'
                  : 'caselog'
                : pathname.match(/^\/\d/)
                ? 'conversation_view'
                : undefined,
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
            editing
              ? {
                  message: 'editorships.new.addEditor',
                  icon: 'new-person',
                  onClick: () => (window.location = links.newEditorship),
                  spotlightKey: 'add_collaborators',
                }
              : {
                  className: selecting && 'pt-intent-success',
                  message: 'deployments.new.teachThisCase',
                  icon: 'follower',
                  onClick: selecting
                    ? () => onSelect(caseSlug)
                    : () => (window.location = links.teach),
                  spotlightKey: 'deploy',
                },

            !selecting &&
              editable &&
              (edited
                ? {
                    disabled: !edited,
                    message: 'cases.edit.save',
                    icon: 'floppy-disk',
                    onClick: saveChanges,
                  }
                : {
                    message: editing
                      ? 'cases.edit.stopEditing'
                      : 'cases.edit.edit',
                    icon: editing ? 'cross' : 'edit',
                    onClick: toggleEditing,
                  }),

            !selecting &&
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
                  {
                    message: 'translations.new.translateThisCase',
                    icon: 'translate',
                    onClick: () => {
                      window.location = links.newTranslation
                    },
                  },
                  {
                    message: 'cases.edit.copyThisCase',
                    icon: 'duplicate',
                    onClick: () => {
                      window.location = links.newCopy
                    },
                  },                  {
                    message: published
                      ? 'cases.edit.unpublishCase'
                      : 'cases.edit.publishCase',
                    icon: published ? 'lock' : 'upload',
                    onClick: togglePublished,
                  },
                ],
                spotlightKey: editing ? 'publish' : undefined,
              },
          ],
        ]
        if (!groups.some(x => x)) return null
        return <Toolbar canBeIconsOnly groups={groups} light={editing} />
      }}
    </ContentItemSelectionContextConsumer>
  )
}

// $FlowFixMe
export default withRouter(
  connect(
    mapStateToProps,
    {
      toggleEditing,
      saveChanges,
      togglePublished,
    }
  )(StatusBar)
)
