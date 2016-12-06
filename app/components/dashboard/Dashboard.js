import React from 'react'
import { I18n } from 'I18n.js'
import { DashboardCase } from 'dashboard/DashboardCase.js'
import {Orchard} from 'concerns/orchard.js'

export class Dashboard extends React.Component {

  constructor(props) {
    super(props)
    this.state = {editing: false, cases: this.props.cases}
    this.setEditing = this.setEditing.bind(this)
    this.deleteEnrollment = this.deleteEnrollment.bind(this)
  }

  deleteEnrollment(enrollmentId) {
    Orchard.prune(`admin/enrollments/${enrollmentId}`).then(() => {
      window.location.reload()
    })
  }

  setEditing() {
    if (this.state.editing) {
      this.setState({editing: false})
    } else {
      this.setState({editing: true})
    }
  }

  renderCases() {
    return this.state.cases.map((kase) => <DashboardCase key={kase.slug} editing={this.state.editing} deleteEnrollment={this.deleteEnrollment} {...kase} />)
  }

  renderInstructions() {
    return [
      <div className="catalog-dashboard__my-cases--empty__case">
        <img src="https://images.unsplash.com/photo-1429704658776-3d38c9990511?ixlib=rb-0.3.5&w=300&h=300&fit=crop&crop=focalpoint&fp-x=.535&fp-y=.6&fp-z=2.5&mono=493092" />
        <strong><I18n meaning="study_a_case" /></strong>
      </div>,
      <div className="catalog-dashboard__my-cases--empty__intro">
        <h3>Choose for yourself</h3>

        <ul>
          <li>Meet different stakeholders and dive deep with a multimodal narrative.</li>
          <li>Shortcut experience by putting principles into practice.</li>
        </ul>

        <p>Cases you select from the index below will be presented here for easy access.</p>
      </div>
    ]
  }

  renderCasesOrInstructions() {
    if (this.state.cases.length > 0) {
      return <div className="catalog-dashboard__my-cases">
        {this.renderCases()}
      </div>
    } else {
      return this.renderInstructions()
    }
  }

  render() {
    let {initials} = this.props
    let {editing} = this.state
    return (
      <div className="catalog-dashboard">
        <div className="catalog-dashboard__reader">
          <h1>Hello, {initials}</h1>
          <h2>
            <I18n meaning="my_cases" />
            <a
              className="catalog-dashboard__edit"
              onClick={this.setEditing}
            >
              { editing ? "Done" : "Edit" }
              <span dangerouslySetInnerHTML={{__html: require(`../../assets/images/react/dashboard-${editing ? 'done' : 'edit'}.svg`)}} />
            </a>
          </h2>
        </div>
        {this.renderCasesOrInstructions()}
      </div>
    )
  }

}
