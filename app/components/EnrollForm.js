import React from 'react'
import {Orchard} from 'concerns/orchard'

export class EnrollForm extends React.Component {
  constructor() {
    super()
    this.enrollReader = this.enrollReader.bind(this)
  }

  enrollReader() {
    let {caseSlug, readerId, enrolled} = this.props
    Orchard.espalier(`admin/cases/${caseSlug}/readers/${readerId}/enrollments/upsert`)
      .then((r) => {
        enrolled(r)
      })
  }

  render () {
    return <div className="CaseOverview--enroll-form">
      <h2>Enroll in this case</h2>
      <p>If this case catches your eye, enroll for easy access from “My Cases.”</p>
      <button onClick={this.enrollReader} >Enroll</button>
    </div>
  }
}
