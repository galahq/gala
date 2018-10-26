/**
 * @providesModule Enrollments
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage, injectIntl } from 'react-intl'

import { Button, Intent } from '@blueprintjs/core'

import { SectionTitle, CaseRow, Element } from 'catalog/shared'
import EnrollmentInstructions from 'catalog/home/EnrollmentInstructions'

import { useToggle } from 'utility/hooks'

import type { Case } from 'redux/state'
import type { Loading } from 'catalog'
import typeof Catalog from 'catalog'

type Props = {
  loading: Loading,
  enrolledCases: Case[],
  intl: any,
  onDeleteEnrollment: $PropertyType<Catalog, 'handleDeleteEnrollment'>,
}
function Enrollments ({
  intl,
  enrolledCases,
  onDeleteEnrollment,
  loading,
}: Props) {
  const [editing, toggleEditing] = useToggle(false)

  return loading.cases ? null : enrolledCases.length > 0 ? (
    <div data-test-id="enrollments">
      <CaseRow baseline>
        <SidebarSectionTitle>
          <FormattedMessage id="enrollments.index.enrolledCases" />
        </SidebarSectionTitle>
        <SidebarButton
          aria-label={
            editing
              ? intl.formatMessage({ id: 'enrollments.index.finishEditing' })
              : intl.formatMessage({ id: 'enrollments.index.editEnrolled' })
          }
          icon={editing ? 'tick' : 'cog'}
          onClick={toggleEditing}
        />
      </CaseRow>

      <UnstyledUL>
        {enrolledCases.map(
          ({ slug, smallCoverUrl, kicker, links, publishedAt } = {}) =>
            slug && (
              <UnstyledLI key={slug}>
                <Element
                  image={smallCoverUrl}
                  text={kicker}
                  href={editing ? null : links.self}
                  rightElement={
                    editing && (
                      <SidebarButton
                        intent={Intent.DANGER}
                        aria-label={intl.formatMessage({
                          id: 'enrollments.destroy.unenroll',
                        })}
                        icon="cross"
                        onClick={() =>
                          onDeleteEnrollment(slug, {
                            displayBetaWarning: !publishedAt,
                          })
                        }
                      />
                    )
                  }
                />
              </UnstyledLI>
            )
        )}
      </UnstyledUL>
    </div>
  ) : (
    <EnrollmentInstructions />
  )
}

export default injectIntl(Enrollments)

const SidebarSectionTitle = styled(SectionTitle)`
  margin: 24px 0.5em 2px 0;
`
const SidebarButton = styled(Button).attrs({
  className: 'pt-minimal pt-button--baseline-aligned',
})`
  margin-right: -10px;
  z-index: 1;
`

const UnstyledUL = styled.ul`
  margin: 0;
  padding: 0;
`
const UnstyledLI = styled.li`
  display: block;
  margin: 0;
  padding: 0;
`
