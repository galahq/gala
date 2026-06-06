import React from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'

import { UnconnectedBillboardTitle } from 'overview/BillboardTitle'
import { UnconnectedCommunityChooser } from 'overview/CommunityChooser'
import MagicLink from 'magic_link'
import { Container as MagicLinkContainer } from 'magic_link/shared'

function parseJsonAttribute (element, attributeName, fallback = {}) {
  const value = element.getAttribute(attributeName)
  if (!value) return fallback

  return JSON.parse(value)
}

export async function mount ({ locale, loadMessages }) {
  const container = document.getElementById('billboard-app')
  if (container == null) return

  const messages = await loadMessages(locale)
  const caseData = parseJsonAttribute(container, 'data-case-data')
  const groupData = parseJsonAttribute(container, 'data-group-data')
  const deploymentKey = container.getAttribute('data-deployment-key')

  createRoot(container).render(
    <IntlProvider locale={locale} messages={messages}>
      <MagicLinkContainer>
        <UnconnectedBillboardTitle updateCase={() => {}} {...caseData} />
        <UnconnectedCommunityChooser
          rounded
          disabled
          activeCommunity={groupData}
          communities={[{ groupData }]}
        />
        <MagicLink deploymentKey={deploymentKey} />
      </MagicLinkContainer>
    </IntlProvider>
  )
}
