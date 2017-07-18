import React from 'react'
import { I18n } from 'utility/I18n'
import { DashboardCase } from 'dashboard/DashboardCase'
import { Orchard } from 'shared/orchard'

export class Dashboard extends React.Component {
  constructor (props) {
    super(props)
    this.state = { editing: false, cases: this.props.cases }
    this.handleSetEditing = this.handleSetEditing.bind(this)
    this.deleteEnrollmentFor = this.deleteEnrollmentFor.bind(this)
  }

  deleteEnrollmentFor (kase) {
    if (
      kase.published ||
      this.props.roles.editor ||
      window.confirm(
        'Are you sure you want to unenroll in this case? Because it is a beta release, you will not be able to reenroll.'
      )
    ) {
      Orchard.prune(`admin/enrollments/${kase.enrollmentId}`).then(() => {
        window.location.reload()
      })
    }
  }

  handleSetEditing () {
    if (this.state.editing) {
      this.setState({ editing: false })
    } else {
      this.setState({ editing: true })
    }
  }

  render () {
    const { initials } = this.props
    const { editing } = this.state
    const hasCases = this.state.cases.length > 0

    return (
      <div
        className={`catalog-dashboard ${hasCases
          ? ''
          : 'catalog-dashboard--empty'}`}
      >
        {!hasCases &&
          <div className="catalog-dashboard__my-cases--empty__case">
            <div>
              <img src="https://images.unsplash.com/photo-1429704658776-3d38c9990511?ixlib=rb-0.3.5&amp;w=300&amp;h=300&amp;fit=crop&amp;crop=focalpoint&amp;fp-x=.535&amp;fp-y=.6&amp;fp-z=2.5&amp;mono=493092" />
              <strong>
                <I18n meaning="study_a_case" />
              </strong>
            </div>
          </div>}

        <div className="catalog-dashboard__reader">
          <h1>
            Hello, {initials}
          </h1>
          {hasCases &&
            <h2>
              <I18n meaning="my_cases" />
              <br />
              <a
                className="catalog-dashboard__edit"
                onClick={this.handleSetEditing}
              >
                {editing ? 'Done' : 'Edit'}{' '}
                <span
                  dangerouslySetInnerHTML={{
                    __html: require(`images/dashboard-${editing
                      ? 'done'
                      : 'edit'}.svg`),
                  }}
                />
              </a>
            </h2>}
        </div>

        {this.state.cases.length > 0
          ? <div className="catalog-dashboard__my-cases">
            {this.state.cases.map(kase =>
              <DashboardCase
                key={kase.slug}
                editing={this.state.editing}
                deleteEnrollmentFor={this.deleteEnrollmentFor}
                case={kase}
              />
              )}
          </div>
          : <div className="catalog-dashboard__my-cases--empty__intro">
            <h2>Choose for yourself</h2>

            <ul>
              <li>
                  Meet different stakeholders and dive deep with a multimodal
                  narrative.
                </li>
              <li>
                  Shortcut experience by putting principles into practice.
                </li>
            </ul>

            <p>
                Cases you select from the index below will be presented here for
                easy access.
              </p>
          </div>}
      </div>
    )
  }
}
