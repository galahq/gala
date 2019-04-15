/**
 * @providesModule ReadingListItems
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { Button, FormGroup, Intent } from '@blueprintjs/core'
import { FormattedMessage, injectIntl } from 'react-intl'

import { Element } from 'catalog/shared'

import type { IntlShape } from 'react-intl'
import type { Case, ReadingListItem } from 'redux/state'

type Props = {
  cases: { string: Case },
  intl: IntlShape,
  items: ReadingListItem[],
  onSetItems: (ReadingListItem[]) => void,
}

function ReadingListItems ({ cases, intl, items, onSetItems }: Props) {
  return (
    <Container>
      {items.map(item => {
        const caseData = cases[item.caseSlug]

        return (
          <Item key={item.caseSlug}>
            <Element
              image={caseData?.smallCoverUrl}
              text={caseData?.kicker}
              rightElement={
                <Button
                  minimal
                  aria-label={intl.formatMessage({
                    id: 'readingListItems.destroy.removeCase',
                  })}
                  intent={Intent.DANGER}
                  icon="trash"
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
              />
            </FormGroup>
          </Item>
        )
      })}
    </Container>
  )
}

export default injectIntl(ReadingListItems)

const Container = styled.ul`
  list-style: none;
  padding: 0;
`

const Item = styled.li.attrs({ className: 'pt-card' })`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 64px;
  }

  & .pt-form-group:last-child {
    margin-bottom: 0;
  }
`
