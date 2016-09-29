import React from 'react';
import mapNL from 'concerns/mapNL.js'
import {I18n} from 'I18n.js'
import {Link} from 'react-router'

class Case extends React.Component {

  constructor() {
    super()
    this.state = {
      saveMessage: "edit_instructions",
      caseData: window.caseData
    }
  }

  generateChapters(splits) {
    return splits.map( (split) => {

      var x = document.createElement('div');
      x.innerHTML = split[1];
      return mapNL(x.children, (para) => { return para } )
    } )
  }

  editing() {
    return this.props.location.pathname.slice(1,5) === "edit"
  }

  didSave(newData = this.state.caseData, shouldReturnToOverview = false, saveMessage = "saved") {
    if (shouldReturnToOverview) { this.props.history.push('/edit') }

    this.setState({
      saveMessage: saveMessage,
      caseData: newData
    })

    setTimeout(() => {
      this.setState({saveMessage: 'edit_instructions'})
    }, 2000)
  }

  render() {
    let c = this.state.caseData

    let editStatusBar
    if (this.editing()) {
      editStatusBar = <div className="flash flash-editing">
                        <I18n meaning={this.state.saveMessage} />
                      </div>
    } else if (!c.published) {
      var link = null
      if (c.reader.canUpdateCase) {
        link = <span>
                 &ensp;&mdash;&ensp;
                 <Link to={`/edit${this.props.location.pathname}`}>
                   <I18n meaning="edit_this_case" />
                 </Link>
               </span>
      }
      editStatusBar = <div className="flash flash-info">
                        <I18n meaning='this_case_is_not_yet_published' />
                        {link}
                      </div>
    }

    c.didSave = this.editing() ? this.didSave.bind(this) : null

    return (
      <div id="Case">
        {editStatusBar}
        {this.props.children && React.cloneElement(this.props.children, c)}
      </div>
    )
  }

}

export default Case
