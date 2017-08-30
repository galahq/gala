/**
 * @providesModule StatusBar
 * @flow
 */

import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { FormattedMessage } from 'react-intl'
import { toggleEditing, saveChanges, togglePublished } from 'redux/actions'

import type { State } from 'redux/state'

function mapStateToProps (state: State) {
  let { edit, caseData } = state
  let { inProgress } = edit
  let { published } = caseData
  return {
    editable: edit.possible,
    editing: inProgress,
    edited: edit.changed,
    published,
  }
}

type BarElement = { message: string, onClick?: () => any }

function StatusBar ({
  editable,
  editing,
  edited,
  published,
  toggleEditing,
  togglePublished,
  saveChanges,
}) {
  const elements: Array<?BarElement> = [
    // Instructions
    editing
      ? { message: 'editInstructions' }
      : !published ? { message: 'betaNotification' } : null,

    // Edit toggle
    editable || editing
      ? { message: editing ? 'endEdit' : 'beginEdit', onClick: toggleEditing }
      : null,

    // Save changes
    edited ? { message: 'save', onClick: saveChanges } : null,

    // Publish the case
    editable && !editing && !edited
      ? {
        message: published ? 'unpublishCase' : 'publishCase',
        onClick: togglePublished,
      }
      : null,
  ]

  if (!elements.some(x => x)) return null

  const StatusBarElement = ({ message, onClick }: BarElement) => {
    const Tag = onClick ? 'a' : 'span'
    return (
      <Tag onClick={onClick}>
        <FormattedMessage id={`statusBar.${message}`} />
      </Tag>
    )
  }

  return (
    <Bar editing={editing}>
      {elements
        .reduce((array, element) => {
          if (element == null) return array
          array.push(<StatusBarElement key={element.message} {...element} />)
          array.push(<span key={`${element.message}:after`}> — </span>)
          return array
        }, [])
        .slice(0, -1)}
    </Bar>
  )
}

export default connect(mapStateToProps, {
  toggleEditing,
  saveChanges,
  togglePublished,
})(StatusBar)

const Bar = styled.div`
  width: 100%;
  padding: 0.2em;

  color: ${({ editing }) => (editing ? '#262626' : '#ebeae4')};
  background-color: ${({ editing }) => (editing ? '#EBEAE4' : '#1d3f5e')};
  border-bottom: 2px solid ${({ editing }) =>
      editing ? '#c0bca9' : '#193c5b'};

  font: 90% 'tenso';
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 0.05em;
  text-transform: initial;
  letter-spacing: 0em;

  & a {
    color: inherit;
    text-decoration: underline;
  }
`
