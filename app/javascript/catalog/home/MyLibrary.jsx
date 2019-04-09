/**
 * @providesModule MyLibrary
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage, injectIntl } from 'react-intl'

import { Button, Intent } from '@blueprintjs/core'

import { CatalogDataContext } from 'catalog/catalogData'
import { SectionTitle, CaseRow, Element } from 'catalog/shared'
import EnrollmentInstructions from 'catalog/home/EnrollmentInstructions'
import { Orchard } from 'shared/orchard'

import { useToggle } from 'utility/hooks'

import type { IntlShape } from 'react-intl'

type Props = {
  intl: IntlShape,
}

function MyLibrary ({ intl }: Props) {
  const [editing, toggleEditing] = useToggle(false)

  const [
    { cases, enrollments, loading: casesLoading },
    updateCatalogData,
  ] = React.useContext(CatalogDataContext)

  const enrolledCases = enrollments.map(e => cases[e.caseSlug])

  async function onDeleteEnrollment (slug, { displayBetaWarning }) {
    const message = `${intl.formatMessage({
      id: 'enrollments.destroy.areYouSure',
    })}${
      displayBetaWarning
        ? `\n\n${intl.formatMessage({
            id: 'enrollments.destroy.youWillNeedAnotherInvitation',
          })}`
        : ''
    }`

    if (!window.confirm(message)) return

    await Orchard.prune(`cases/${slug}/enrollment`)

    updateCatalogData(draft => {
      draft.enrollments = draft.enrollments.filter(e => e.caseSlug !== slug)
    })
  }

  return casesLoading ? null : enrolledCases.length > 0 ? (
    <div>
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

      <UnstyledUL data-test-id="enrollments">
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

export default injectIntl(MyLibrary)

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
