import React from 'react'

import {Filter} from 'enrollments/Filter'
import {CaseEnrollment} from 'enrollments/CaseEnrollment'

class CaseRow extends React.Component {
  render() {
    let {slug, kicker, smallCoverUrl, enrollments} = this.props.case
    return <tr className="enrollments-case">
      <td><img src={smallCoverUrl} /></td>
      <td className="enrollments-case-kicker">{kicker}</td>
      {['student', 'instructor'].map((type) => {
        return <td key={type}>
          <CaseEnrollment
            caseSlug={slug}
            type={type}
            enrollments={enrollments}
            updateEnrollments={this.props.updateEnrollments}
          />
        </td>
      })}
    </tr>
  }
}

class CasesTable extends React.Component {
  render() {
    return <table>
        <tbody>
          {this.props.cases.map((c) => {
            return <CaseRow key={c.slug} case={c} updateEnrollments={this.props.updateEnrollments} />
          })}
        </tbody>
      </table>
  }
}

export class CasesSection extends React.Component {
  constructor() {
    super()
    this.state = {
      filterString: ""
    }
  }

  changeFilter(e) {
    this.setState({filterString: e.target.value})
  }

  filter(c) {
    return c.kicker.match(RegExp(this.state.filterString, 'i')) !== null
  }

  render() {
    return (
      <section className="enrollments-section enrollments-section-cases">
        <h2>Cases</h2>
        <Filter filterString={this.state.filterString} model="cases" onChange={this.changeFilter.bind(this)} />
        <CasesTable cases={this.props.cases.filter(this.filter.bind(this))} updateEnrollments={this.props.updateEnrollments} />
      </section>
    )
  }

}
