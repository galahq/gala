/**
 * @providesModule AuthorsList
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { acceptKeyboardClick } from 'shared/keyboard'

import { Intent, Position, Tooltip } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'

import AuthorsListForm from './AuthorsListForm'
import Acknowledgements from './Acknowledgements'
import { FormattedList } from 'shared/react-intl'
import { LabelForScreenReaders } from 'utility/A11y'

import type { Author, Byline } from 'redux/state'
import type { AuthorsListFormState } from './AuthorsListForm'

class AuthorsList extends React.Component<
  {
    canEdit: boolean,
    byline: Byline,
    onChange: Byline => any,
  },
  { editing: boolean }
> {
  state = { editing: false }

  handleStartEditing = (e: SyntheticEvent<*>) => {
    if (this.props.canEdit) this.setState({ editing: true })
  }

  handleFinishEditing = (formState: ?AuthorsListFormState) => {
    this.setState({ editing: false })
    if (formState != null) {
      this.props.onChange(formState)
    }
  }

  render () {
    const { canEdit, byline } = this.props
    const { authors, translators, acknowledgements } = byline

    const isButton = authors.length === 0 && canEdit

    return (
      // eslint-disable-next-line
      <div
        className={isButton ? 'pt-button pt-icon-people' : ''}
        tabIndex={canEdit ? '0' : null} // eslint-disable-line
        role={canEdit ? 'button' : null}
        style={{ cursor: canEdit ? 'pointer' : null }}
        onKeyPress={acceptKeyboardClick}
        onClick={this.handleStartEditing}
      >
        {isButton ? (
          <FormattedMessage id="cases.edit.addAuthors" />
        ) : (
          <p>
            <FormattedList
              list={authors.map(a => (
                <AuthorName key={a.name} author={a} canEdit={canEdit} />
              ))}
            />
            <Acknowledgements contents={acknowledgements} />
            <br />
            {translators.length !== 0 && (
              <em>
                <FormattedMessage
                  id="activerecord.attributes.case.translators.js"
                  values={{ count: translators.length }}
                />
                <FormattedList
                  list={translators.map(t => <span key={t}>{t}</span>)}
                />
              </em>
            )}
          </p>
        )}
        {canEdit && (
          <AuthorsListForm
            byline={byline}
            editing={this.state.editing}
            onFinishEditing={this.handleFinishEditing}
          />
        )}
      </div>
    )
  }
}

export default AuthorsList

const AuthorName = ({
  author,
  canEdit,
}: {
  author: Author,
  canEdit: boolean,
}) => {
  const { name, institution } = author
  return institution ? (
    <StyledTooltip
      content={institution}
      isDisabled={canEdit}
      intent={Intent.SUCCESS}
      position={Position.BOTTOM_LEFT}
    >
      <span>
        {name}
        <LabelForScreenReaders>({institution})</LabelForScreenReaders>
      </span>
    </StyledTooltip>
  ) : (
    name
  )
}

const StyledTooltip = styled(Tooltip).attrs({
  className: 'pt-tooltip-indicator',
})`
  border-bottom-color: #ffffffaa;
`
