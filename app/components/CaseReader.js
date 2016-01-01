import React from 'react';
import '../stylesheets/CaseReader.scss';

import Narrative from './Narrative.js'
import Sidebar from './Sidebar.js'

class CaseReader extends React.Component {
  render () {
    let {title, narrative} = this.props
    narrative = [
      <div>
        <p>These are the contents of the card, and <a>it has Edgenotes</a>.</p>
        <p>Here is the second paragraph in this card.</p>
      </div>,
      <div>
        <p>These are the contents of the card, and <a>it has Edgenotes</a>.  These are the contents of the card, and <a>it has Edgenotes</a>.</p>
      </div>
    ]
    return (
      <div id="CaseReader">
        <header>
          <h1 id="logo">Michigan Sustainability Cases</h1>
        </header>
        <Narrative sections={narrative}/>
        <Sidebar title={title} />
      </div>
    )
  }
}

export default CaseReader
