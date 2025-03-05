/**
 * @providesModule ReadingListItem
 * @flow
 */

import * as React from 'react'
import produce from 'immer'
import styled from 'styled-components'
import { Button, FormGroup, Intent } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'

import { Element as CatalogElement } from 'catalog/shared'

import type { IntlShape } from 'react-intl'
import type { DraggableProps, DragHandleProps } from 'react-beautiful-dnd'
import type { Case, ReadingListItem as ReadingListItemT } from 'redux/state'

type Props = {
  caseData: ?Case,
  intl: IntlShape,
  item: ReadingListItemT,
  onChange: ReadingListItemT => void,
  onDelete: () => void,
  ...DraggableProps,
  ...DragHandleProps,
}

function ReadingListItem (
  {
    caseData,
    intl,
    item,
    onChange,
    onDelete,
    ...draggableAndHandleProps
  }: Props,
  ref
) {
  return (
    <Item ref={ref} {...draggableAndHandleProps}>
      <CatalogElement
        image={caseData?.smallCoverUrl}
        text={caseData?.kicker || ''}
        rightElement={
          <Button
            minimal
            aria-label={intl.formatMessage({
              id: 'readingListItems.destroy.removeCase',
            })}
            intent={Intent.DANGER}
            icon="trash"
            onClick={onDelete}
          />
        }
      />

      <FormGroup
        label={
          <FormattedMessage id="activerecord.attributes.readingListItem.notes" />
        }
      >
        <textarea
          aria-label={intl.formatMessage(
            { id: 'readingListItems.edit.notesAboutCase' },
            { case: caseData?.kicker }
          )}
          className="bp3-input bp3-fill"
          value={item.notes}
          onChange={e => {
            onChange(
              produce(item, draft => {
                draft.notes = e.target.value
              })
            )
          }}
        />
      </FormGroup>
    </Item>
  )
}

export default React.forwardRef(ReadingListItem)

const Item = styled.li.attrs({ className: 'bp3-card', tabIndex: '0' })`
  margin-bottom: 32px;

  & .bp3-form-group:last-child {
    margin-bottom: 0;
  }
`
