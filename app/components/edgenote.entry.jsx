import React from 'react'
import { render } from 'react-dom'
import { Router, Route, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'

import {Card} from 'Narrative'
import EdgenoteContents from 'EdgenoteContents'

import '../assets/stylesheets/Edgenote.scss'
import '../assets/stylesheets/EdgenoteContents.css.scss'

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false  })

window.galaHostname = "//www.learnmsc.org"
window.i18n = {locale: "en"}

class EmbeddedCard extends React.Component {
  render() {
    return <div>
      <Card
        didSave={null}
        solid={true}
        selectedPage={false}
        {...this.props.route}
      />
      {this.props.children && React.cloneElement(this.props.children, {didSave: null})}
    </div>
  }
}

$('.gala-embedded-card').each( (i, reactTarget) => {

  render(<Router history={appHistory}>
    <Route path="/(edgenotes)" card={{content: $(reactTarget).html()}} component={EmbeddedCard} i={i}>
      <Route path="/:selectedPage/:edgenoteID" component={EdgenoteContents} />
    </Route>
  </Router>, $(reactTarget)[0])

} )
