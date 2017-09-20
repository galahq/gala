/**
 * @providesModule Enrollments
 * @flow
 */

import React, { Component } from 'react'
import styled from 'styled-components'
import { FormattedMessage, injectIntl } from 'react-intl'

import { Button, Intent } from '@blueprintjs/core'

import { SectionTitle, CaseRow, Element } from 'catalog/shared'

import type { Case } from 'redux/state'
import type Catalog, { Loading } from 'catalog'

type Props = {
  loading: Loading,
  enrolledCases: Case[],
  intl: any,
  onDeleteEnrollment: $PropertyType<Catalog, 'handleDeleteEnrollment'>,
}
class Enrollments extends Component {
  props: Props
  state = { editing: false }

  handleToggleEditing = () => {
    this.setState(({ editing }) => ({
      editing: !editing,
    }))
  }

  render () {
    const { editing } = this.state
    const { intl, enrolledCases, onDeleteEnrollment } = this.props
    return this.props.loading.cases ? null : enrolledCases.length > 0 ? (
      <div>
        <CaseRow baseline>
          <SidebarSectionTitle>
            <FormattedMessage
              id="catalog.enrolledCases"
              defaultMessage="Enrolled cases"
            />
          </SidebarSectionTitle>
          <SidebarButton
            aria-label={
              editing
                ? intl.formatMessage({
                  id: 'finishEditing',
                  defaultMessage: 'Finish editing',
                })
                : intl.formatMessage({
                  id: 'catalog.editEnrolled',
                  defaultMessage: 'Edit enrolled cases',
                })
            }
            iconName={editing ? 'tick' : 'cog'}
            onClick={this.handleToggleEditing}
          />
        </CaseRow>
        <UnstyledUL>
          {enrolledCases.map(
            ({ slug, smallCoverUrl, kicker, url, publishedAt } = {}) =>
              slug && (
                <UnstyledLI key={slug}>
                  <Element
                    image={smallCoverUrl}
                    text={kicker}
                    href={editing ? null : url}
                    rightElement={
                      editing && (
                        <SidebarButton
                          intent={Intent.DANGER}
                          aria-label={intl.formatMessage({
                            id: 'catalog.unenroll',
                            defaultMessage: 'Unenroll from this case',
                          })}
                          iconName="cross"
                          onClick={() =>
                            onDeleteEnrollment(slug, {
                              displayBetaWarning: !publishedAt,
                            })}
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
      <Callout>
        <h5>
          <FormattedMessage
            id="catalog.chooseForYourself"
            defaultMessage="Choose for yourself"
          />
        </h5>
        <ul>
          <li>
            <FormattedMessage
              id="catalog.meetStakeholders"
              defaultMessage="Meet different stakeholders and dive deep with a multimodal narrative."
            />
          </li>
          <li>
            <FormattedMessage
              id="catalog.shortcutExperience"
              defaultMessage="Shortcut experience by putting principles into practice."
            />
          </li>
          <li>
            <FormattedMessage
              id="catalog.joinConversation"
              defaultMessage="Join the conversation by asking questions and paying your learning forward."
            />
          </li>
        </ul>
        <FormattedMessage
          id="catalog.enrollmentsInstruction"
          defaultMessage="Cases you enroll in will be presented here for easy access."
        />
      </Callout>
    )
  }
}

export default injectIntl(Enrollments)

const SidebarSectionTitle = SectionTitle.extend`margin: 24px 0.5em 2px 0;`
const SidebarButton = styled(Button).attrs({ className: 'pt-minimal' })`
  margin-right:-10px;
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
const Callout = styled.div.attrs({ className: 'pt-callout' })`
  margin-top: 1.5em;
  line-height: 1.4;
`
