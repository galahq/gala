/**
 * @noflow
 */

import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import { UnconnectedBillboardTitle } from 'overview/BillboardTitle'
import { UnconnectedCommunityChooser } from 'overview/CommunityChooser'

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

if (container != null) {
  ReactDOM.render(
    <Column>
      <UnconnectedBillboardTitle updateCase={() => {}} {...caseData} />
      <UnconnectedCommunityChooser rounded activeCommunity={groupData} />

      <form action="/enrollments" method="POST">
        <input type="hidden" name="deployment_key" value={deploymentKey} />
        <Button>Let’s get started!</Button>
      </form>
    </Column>,
    container
  )
}
