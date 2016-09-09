import React from 'react'

import {Filter} from 'enrollments/Filter'
import {CaseEnrollment} from 'enrollments/CaseEnrollment'

class CaseRow extends React.Component {
  constructor() {
    super()
    this.state = { showingDetails: false }
  }

  renderEnrolledReaders(type) {
    let readerTags = this.props.case.enrollments[type].map((enrollment) => {
      return <li key={enrollment.reader.id}>{enrollment.reader.name}</li>
    })
    return <div key={`enrollments-case-enrolled-readers-${type}`} className="enrollments-case-enrolled-readers">
      <h5>{type}s</h5>
      <ul>{readerTags}</ul>
    </div>
  }

  renderDetails() {
    let {title, caseAuthors} = this.props.case
    if (this.state.showingDetails === true) {
      return <tr>
        <td colSpan="4">
          <div className="enrollments-details">
            <div className="BillboardTitle">
              <h1>{title}</h1>
              <h4>{caseAuthors}</h4>
            </div>
            {['student', 'instructor'].map((type) => {
              return this.renderEnrolledReaders(type)
            })}
          </div>
        </td>
      </tr>
    } else { return null }
  }

  render() {
    let {slug, kicker, smallCoverUrl, enrollments} = this.props.case
    return <tbody>
      <tr onClick={() => {this.setState({showingDetails: !this.state.showingDetails})}} className="enrollments-case">
        <td><img src={smallCoverUrl} /></td>
        <td className="enrollments-case-kicker">
          {kicker}
        </td>
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
      {this.renderDetails()}
    </tbody>
  }
}

class CasesTable extends React.Component {
  renderCases(cases) {
    return cases.map((c) => {
      return <CaseRow key={c.slug} case={c} updateEnrollments={this.props.updateEnrollments} />
    })
  }

  renderCaseSection(sectionName, cases) {
    if (cases.length > 0) {
      return [
        <thead key={`${sectionName}-head`} >
          <tr><td colSpan="4">{sectionName}</td></tr>
        </thead>,
        this.renderCases(cases)
      ]
    } else { return null }
  }

  render() {
    let forthcomingCases = this.props.cases.filter( (c) => { return c.published !== true } )
    let publishedCases = this.props.cases.filter( (c) => { return c.published === true } )
    return <table>
      {this.renderCaseSection("Forthcoming Cases", forthcomingCases)}
      {this.renderCaseSection("Published Cases", publishedCases)}
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
