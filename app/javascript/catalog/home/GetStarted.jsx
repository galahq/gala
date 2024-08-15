import * as React from 'react'
import { Orchard, OrchardError } from 'shared/orchard'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'

// TODO: Add logic to make sure last edited is not published?
export default function GetStarted() {
  const [recent, update] = React.useState(null)
  React.useEffect(() => {
    Orchard.harvest('/editorships/recent')
      .then(apple => update(apple))
      .catch(e => {
        console.log(`uhoh: ${e.message}`)
      })
  }, [])
  for (const case_ of recent?.cases || [] ){
    console.log(`case: ${case_.kicker}, updated at ${case_.updated_at}`)
    console.log(case_)
  }
  

  // we're routing to: @route [GET] `/cases/slug/edit`
  return (
    <Block>
      {recent ? (
        <>
          <FormattedMessage id="catalog.infoPanel.text.jumpIn" />
          <FormattedList cases={recent.cases} />
        </>
      ) : (
        <FormattedMessage id="catalog.infoPanel.text.noCurrent" />
      )}
      <FormattedBar />
    </Block>
  )
}

function RecentList({ cases }) {
  return (
      cases.map((case_, index) => (
      <a href={'/cases/' + case_.slug}>
        <Case key={index}>
          {"[case image] "} 
          
            {case_.kicker ? case_.kicker : 'Untitled Case'}
        </Case>
        </a>
      ))
  )
}

function BottomBar() {
  return (
    <Row>
    <Left>
      <a href="/cases/new">
        <FormattedMessage id="catalog.infoPanel.text.newCase" />{" ›"}
      </a>
      </Left>
      <Right>
      <a href="https://docs.learngala.com/docs/">
        <FormattedMessage id="catalog.infoPanel.text.readDocs" />{" ›"}
      </a>
      </Right>
      </Row>
  )
}

const Case = styled.div`
  margin-bottom: 0.5em;`

const Left = styled.div`
  color: white;
  margin-right: 0.5em;
  `

const Right = styled.div`
  color: white;
  margin-left: 0.5em;
  `

const Row = styled.div`
  
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
  color: white;
  text-wrap: nowrap;
  position: relative;
  height: 0;
  `
const FormattedList = styled(RecentList)`
  text-align: left;
  flex-grow: 1;
`
const Block = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1em;
`

const FormattedBar = styled(BottomBar)`
  flex-align: flex-end;
  flex-grow: 1;
  text-align: right;
`