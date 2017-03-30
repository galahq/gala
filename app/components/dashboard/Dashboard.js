import React from 'react'
import { I18n } from 'I18n.js'
import { DashboardCase } from 'dashboard/DashboardCase.js'
import {Orchard} from 'concerns/orchard.js'

export class Dashboard extends React.Component {

  constructor(props) {
    super(props)
    this.state = {editing: false, cases: this.props.cases}
    this.setEditing = this.setEditing.bind(this)
    this.deleteEnrollmentFor = this.deleteEnrollmentFor.bind(this)
  }

  deleteEnrollmentFor(kase) {
    if (kase.published || this.props.roles.editor
        || window.confirm("Are you sure you want to unenroll in this case? Because it is a beta release, you will not be able to reenroll.")) {
      Orchard.prune(`admin/enrollments/${kase.enrollmentId}`).then(() => {
        window.location.reload()
      })
    }
  }

  setEditing() {
    if (this.state.editing) {
      this.setState({editing: false})
    } else {
      this.setState({editing: true})
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

        { this.state.cases.length > 0

          ? <div className="catalog-dashboard__my-cases">
            {
              this.state.cases.map((kase) => <DashboardCase key={kase.slug}
                editing={this.state.editing}
                deleteEnrollmentFor={this.deleteEnrollmentFor}
                case={kase} />)
            }
          </div>

          : <div>
            <div className="catalog-dashboard__my-cases--empty__case">
              <img src="https://images.unsplash.com/photo-1429704658776-3d38c9990511?ixlib=rb-0.3.5&w=300&h=300&fit=crop&crop=focalpoint&fp-x=.535&fp-y=.6&fp-z=2.5&mono=493092" />
              <strong><I18n meaning="study_a_case" /></strong>
            </div>

            <div className="catalog-dashboard__my-cases--empty__intro">
              <h3>Choose for yourself</h3>

              <ul>
                <li>Meet different stakeholders and dive deep with a multimodal narrative.</li>
                <li>Shortcut experience by putting principles into practice.</li>
              </ul>

              <p>Cases you select from the index below will be presented here for easy access.</p>
            </div>
          </div>
        }

      </div>
    )
  }

}
