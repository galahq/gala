/**
 *
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'

import { UnconnectedBillboardTitle } from 'overview/BillboardTitle'
import { UnconnectedCommunityChooser } from 'overview/CommunityChooser'
import MagicLink from 'magic_link'
import { Container } from 'magic_link/shared'

import loadMessages from '../../../config/locales' // eslint-disable-line
const { locale } = (window.i18n)

const container = document.getElementById('billboard-app')

const caseData = JSON.parse(container.getAttribute('data-case-data'))
const groupData = JSON.parse(container.getAttribute('data-group-data'))
const deploymentKey = container.getAttribute('data-deployment-key')

loadMessages(locale).then((messages) => {
  if (container != null) {
    createRoot(container).render(
      <IntlProvider locale={locale} messages={messages}>
        <Container>
          <UnconnectedBillboardTitle updateCase={() => {}} {...caseData} />
          <UnconnectedCommunityChooser
            rounded
            disabled
            activeCommunity={groupData}
            communities={[{ groupData }]}
          />
          <MagicLink deploymentKey={deploymentKey} />
        </Container>
      </IntlProvider>
    )
  }
})
