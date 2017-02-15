import React from 'react';
import { connect } from 'react-redux'
import StatusBar from 'StatusBar.js'
import { parseAllCards } from 'redux/actions.js'

function mapStateToProps(state) {
  return {
    editing: state.edit.inProgress,
    pages: state.caseData.pageIds.map( id => state.pagesById[id] ),
  }
}

class Case extends React.Component {
  constructor() {
    super()
    this.state = {
      saveMessage: "edit_instructions",
      caseData: window.caseData,
    }
  }

  componentDidMount() {
    setTimeout( () => this.props.parseAllCards(), 1 )
  }

  render() {
    let c = this.state.caseData
    let { editing, pages } = this.props

    c.didSave = this.editing() ? this.didSave.bind(this) : null
    c.enrolled = this.didSave.bind(this)

    return (
      <div id="Case">
        <StatusBar />
        {this.props.children && React.cloneElement(
          this.props.children,
          {
            ...c,
            editing, pages,
          })}
      </div>
    )
  }

  editing() {
    return this.props.location.pathname.slice(1,5) === "edit"
  }

  didSave(newData = this.state.caseData, shouldReturnToOverview = false, saveMessage = "saved") {
    if (shouldReturnToOverview) { this.props.history.push('/edit') }

    this.setState({
      saveMessage: saveMessage,
      caseData: newData,
    })

    setTimeout(() => {
      this.setState({saveMessage: 'edit_instructions'})
    }, 2000)
  }
}

export default connect(
  mapStateToProps,
  { parseAllCards },
)(Case)
