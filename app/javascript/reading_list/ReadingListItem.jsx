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
import type { Case, ReadingListItem as ReadingListItemT } from 'redux/state'

type Props = {
  caseData: ?Case,
  intl: IntlShape,
  item: ReadingListItemT,
  onChange: ReadingListItemT => void,
  onDelete: () => void,
}

function ReadingListItem (
  { caseData, intl, item, onChange, onDelete }: Props,
  ref
) {
  return (
    <Item ref={ref}>
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
          className="pt-input pt-fill"
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

const Item = styled.li.attrs({ className: 'pt-card', tabIndex: '0' })`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 64px;
  }

  & .pt-form-group:last-child {
    margin-bottom: 0;
  }
`
