import React from 'react'
import {ReadersSection} from 'enrollments/ReadersSection'
import {CasesSection} from 'enrollments/CasesSection'
import {Orchard} from 'concerns/orchard.js'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import update from 'react/lib/update'


class Enrollments extends React.Component {

  constructor() {
    super()
    this.state = {
      readers: [],
      groups: [],
      cases: []
    }
  }

  download() {
    Orchard.harvest('admin/readers').then((r) => {this.setState({readers: r})})
    Orchard.harvest('admin/cases').then((r) => {this.setState({cases: r})})
    Orchard.harvest('admin/groups').then((r) => {this.setState({groups: r})})
  }

  componentDidMount() {
    this.download()
  }

  updateEnrollments(caseSlug, newCase) {
    let i = this.state.cases.findIndex((c) => { return c.slug === caseSlug })
    this.setState(update(this.state, {
      cases: {$splice: [[i, 1, newCase]]}
    }))
  }

  render() {
    let {readers, groups, cases} = this.state
    return (
      <main id="enrollments-app">
        <ReadersSection readers={readers} groups={groups} />
        <CasesSection cases={cases} updateEnrollments={this.updateEnrollments.bind(this)} />
      </main>
    )
  }

}

export default DragDropContext(HTML5Backend)(Enrollments);
