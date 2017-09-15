/**
 * @providesModule Enrollments
 * @flow
 */

import React, { Component } from 'react'
import styled from 'styled-components'

import { Button, Intent } from '@blueprintjs/core'

import { SectionTitle, CaseRow, Element } from 'catalog/shared'

import type { Case } from 'redux/state'
import type Catalog from 'catalog'

type Props = {
  enrolledCases: Case[],
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
    return (
      <div>
        <CaseRow baseline>
          <SidebarSectionTitle>Enrolled cases</SidebarSectionTitle>
          <SidebarButton
            aria-label={editing ? 'Finish editing' : 'Edit enrolled cases'}
            iconName={editing ? 'tick' : 'cog'}
            onClick={this.handleToggleEditing}
          />
        </CaseRow>
        <UnstyledUL>
          {this.props.enrolledCases.map(
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
                          aria-label="Unenroll from this case"
                          iconName="cross"
                          onClick={() =>
                            this.props.onDeleteEnrollment(slug, {
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
    )
  }
}

export default Enrollments

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
