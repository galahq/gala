/**
 * @providesModule MyDashboard
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

function MyDashboard({ intl }: Props) {
  const [editing, toggleEditing] = useToggle(false)

  const [
    { cases, editorCases, enrollments, managerships, loading: casesLoading, savedReadingLists },
    updateCatalogData,
  ] = React.useContext(CatalogDataContext)

  // Group enrolled cases by discussion group
  const enrolledCasesByGroup = enrollments
    .filter(e => e.activeGroupId !== null) // Exclude Global Community enrollments
    .reduce((groups, e) => {
      const caseData = cases[e.caseSlug]
      if (!caseData) return groups

      const groupName = e.groupName || e.communityName || 'Other Groups'
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push({
        ...caseData,
        groupName: e.groupName,
        communityName: e.communityName
      })
      return groups
    }, {})


  const totalEnrolledCases = Object.values(enrolledCasesByGroup).flat().length

  const pendingRequest = (count) => count === 0 ? null : <PendingRequests className='pt-tag pt-interactive pt-round pt-intent-primary'>{count}</PendingRequests>

  return (
    <div>

      <CaseRow baseline>
        <SidebarSectionTitle>
          <FormattedMessage id="catalog.myDashboard" />
        </SidebarSectionTitle>
      </CaseRow>

      {managerships.length > 0 && (
        <>
          <CaseRow baseline>
            <SidebarSubsectionTitle>
              <FormattedMessage id="libraries.edit.libraryManagement" />
            </SidebarSubsectionTitle>
          </CaseRow>

          <UnstyledUL>
            {managerships.map(({ name, links, param, logoUrl, pendingRequestCount } = {}) => {
              return (
                <UnstyledLI key={param}>
                  <Element
                    image={logoUrl}
                    text={name}
                    href={links.edit}
                    rightElement={pendingRequest(pendingRequestCount)}
                    wide={true}
                  />
                </UnstyledLI>
              )
            })}
          </UnstyledUL>
        </>
      )}
      <CaseRow baseline>
        <SidebarSubsectionTitle>
          <FormattedMessage id="readingLists.index.readingLists" />
        </SidebarSubsectionTitle>

        <SidebarButton
          aria-label={intl.formatMessage({
            id: 'readingLists.new.newList',
          })}
          icon="add"
          role="link"
          onClick={() => (window.location = '/reading_lists/new')}
        />
      </CaseRow>
      {Object.keys(editorCases).length > 0 && (
        <>
          <CaseRow baseline>
            <SidebarSubsectionTitle>
              <FormattedMessage id="catalog.myCases" />
            </SidebarSubsectionTitle>
          </CaseRow>

          <UnstyledUL>
            {Object.values(editorCases)
              .slice(0, 4)
              .map(({ slug, smallCoverUrl, kicker, links, publishedAt } = {}) =>
                slug && (
                  <UnstyledLI key={slug}>
                    <Element
                      image={smallCoverUrl}
                      text={kicker}
                      href={links.self}
                    />
                  </UnstyledLI>
                )
              )}
          </UnstyledUL>

          {Object.keys(editorCases).length > 5 && (
            <CaseRow baseline>
              <ViewMoreLink href="/my_cases">
                <FormattedMessage
                  id="catalog.viewAllCases"
                  values={{ count: Object.keys(editorCases).length }}
                />
              </ViewMoreLink>
            </CaseRow>
          )}
        </>
      )}


      <UnstyledUL>
        {savedReadingLists.map(({ param, title, caseSlugs, links } = {}) => {
          const images = caseSlugs.map(slug => cases[slug].smallCoverUrl)

          return (
            <UnstyledLI key={param}>
              <Element
                images={images}
                text={title}
                href={editing ? null : links.self}
              />
            </UnstyledLI>
          )
        })}
      </UnstyledUL>

      {totalEnrolledCases > 0 && (
        <>
          <CaseRow baseline>
            <SidebarSubsectionTitle>
              <FormattedMessage id="enrollments.index.enrolledCases" />
            </SidebarSubsectionTitle>

            <SidebarButton
              aria-label={
                editing
                  ? intl.formatMessage({
                    id: 'enrollments.index.finishEditing',
                  })
                  : intl.formatMessage({
                    id: 'enrollments.index.editEnrolled',
                  })
              }
              icon={editing ? 'tick' : 'cog'}
              onClick={toggleEditing}
            />
          </CaseRow>

          <div data-test-id="enrollments">
            {Object.entries(enrolledCasesByGroup).map(([groupName, groupCases]) => (
              <div key={groupName}>
                <GroupHeader>
                  {groupName}
                </GroupHeader>
                <UnstyledUL>
                  {groupCases.map(
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
            ))}
          </div>
        </>
      )}

      {totalEnrolledCases === 0 && savedReadingLists.length === 0 && (
        <EnrollmentInstructions />
      )}
    </div>
  )

  async function onDeleteEnrollment(slug, { displayBetaWarning }) {
    const message = `
      ${intl.formatMessage({ id: 'enrollments.destroy.areYouSure' })}
      ${displayBetaWarning
        ? `${intl.formatMessage({
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
}

export default injectIntl(MyDashboard)

const SidebarSectionTitle = styled(SectionTitle)`
  flex: 1;
  margin: 24px 0.5em 2px 0;
`

const SidebarSubsectionTitle = styled(SectionTitle).attrs({ as: 'h3' })`
  font-weight: 600;
  letter-spacing: 0.1px;
  margin: 8px 0.5em 2px 0;
  text-transform: capitalize;
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

const PendingRequests = styled.span`
  margin-right: 0.5em;

`

const ViewMoreLink = styled.a`
  span {
  color: #C7CCD6;
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
}
`

const GroupHeader = styled.div`
  font-size: 14px;
  color: #C7CCD6;
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
  text-transform: capitalize;
  font-style: italic;
`
