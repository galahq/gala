import React from 'react';
import '../stylesheets/CaseReader.scss';

import Narrative from './Narrative.js'
import Sidebar from './Sidebar.js'

class CaseReader extends React.Component {
  render () {
    let {title, narrative} = this.props
    narrative = [
      <div>
        <h3>1. Introduction</h3>
        <p>J. R. Richardson took a break from some documents he was reading to
          think about a difficult decision that he would face in the upcoming
          days: whether to vote in favor of allowing a wolf hunt to take place
          in the state of Michigan. As chair of the Natural Resources Commission
          (NRC), a seven-person policy advisory body to the state’s Department
          of Natural Resources (DNR), Richardson had dealt with his fair share
          of contentious issues during his tenure at the NRC since 2007. But he
          could remember none that had aroused such passion from all sides as
          the wolf hunt issue. As a result, he felt a great deal of pressure to
          lead the NRC to make the right decision based on sound science,
          respect <a href="#">for the needs of the people who are affected</a> by
          the presence of wolves, and sensitivity to public opinion.</p>
      </div>,
      <div>
        <p>These are the contents of the card, and <a>it has Edgenotes</a>.  These are the contents of the card, and <a>it has Edgenotes</a>.</p>
      </div>
    ]
    return (
      <div id="CaseReader">
        <header>
          <h1 id="logo">MSC Logo</h1>
        </header>
        <Sidebar title={title} />
        <Narrative sections={narrative}/>
      </div>
    )
  }
}

export default CaseReader
