/**
 * @noflow
 */

import 'babel-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { FormattedMessage, addLocaleData, IntlProvider } from 'react-intl'

import { UnconnectedBillboardTitle } from 'overview/BillboardTitle'
import { UnconnectedCommunityChooser } from 'overview/CommunityChooser'

const { locale } = (window.i18n: { locale: string })
import messages from '../../../config/locales' // eslint-disable-line

const container = document.getElementById('billboard-app')

const caseData = JSON.parse(container.getAttribute('data-case-data'))
const groupData = JSON.parse(container.getAttribute('data-group-data'))
const deploymentKey = container.getAttribute('data-deployment-key')

const Column = styled.div`
  max-width: 40em;
  padding: 0 1em;

  display: flex;
  flex-direction: column;
  align-items: center;
`

const Button = styled.button.attrs({
  className: 'pt-button pt-large pt-intent-success',
  type: 'submit',
})`
  margin: 2em;
`

import(`react-intl/locale-data/${locale.substring(0, 2)}`).then(m => {
  addLocaleData(m)

  if (container != null) {
    ReactDOM.render(
      <IntlProvider locale={locale} messages={messages[locale]}>
        <Column>
          <UnconnectedBillboardTitle updateCase={() => {}} {...caseData} />
          <UnconnectedCommunityChooser
            rounded
            disabled
            activeCommunity={groupData}
            communities={[{ groupData }]}
          />

          <form action="/magic_link" method="POST">
            <input type="hidden" name="deployment_key" value={deploymentKey} />
            <Button>
              <FormattedMessage id="magicLink.show.letsGetStarted" />
            </Button>
          </form>
        </Column>
      </IntlProvider>,
      container
    )
  }
})
