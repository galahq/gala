/**
 * @providesModule Acknowledgements
 *
 */

import * as React from 'react'
import styled from 'styled-components'

import { injectIntl, FormattedMessage } from 'react-intl'
import { Dialog, Button } from '@blueprintjs/core'


class Acknowledgements extends React.Component {
  state = { isOpen: false }

  handleClick = (e) => {
    e.stopPropagation()
    this.setState(({ isOpen }) => ({
      isOpen: !isOpen,
    }))
  }

  render() {
    const { contents, intl } = this.props
    if (!contents) return null
    const acknowledgements = intl.formatMessage({
      id: 'activerecord.attributes.case.acknowledgements',
    })
    return [
      <div><AcknowledgementsButton
        key="1"
        aria-label={acknowledgements}
        title={acknowledgements}
        onClick={this.handleClick}
      >Acknowledgements</AcknowledgementsButton></div>,
      <Dialog
        key="2"
        title={acknowledgements}
        className="pt-dark"
        {...this.state}
        onClose={this.handleClick}
      >
        <div className="pt-dialog-body">
          <AcknowledgementsContents>{contents}</AcknowledgementsContents>
        </div>
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button onClick={this.handleClick}>
              <FormattedMessage id="helpers.close" />
            </Button>
          </div>
        </div>
      </Dialog>,
    ]
  }
}
export default injectIntl(Acknowledgements)

const AcknowledgementsButton = styled(Button).attrs({
  className: 'pt-minimal pt-small pt-button--baseline-aligned',
  rightIcon: 'more',
})`
  transform: translate(-7px);
  margin-top: .2rem;
span {
  color: #5e6c78;
}

svg {
  transform: translate(-3px, 1px);
}
`

const AcknowledgementsContents = styled.p.attrs({
  className: 'pt-running-text',
})`
  white-space: pre-wrap;
  margin: 0;
`
