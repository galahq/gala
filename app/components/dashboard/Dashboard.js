import React from 'react'
import { I18n } from 'I18n.js'
import { DashboardCase } from 'dashboard/DashboardCase.js'

export class Dashboard extends React.Component {

  renderCases() {
    return this.props.cases.map((kase) => <DashboardCase {...kase} />)
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
    if (this.props.cases.length > 0) {
      return <div className="catalog-dashboard__my-cases">
        {this.renderCases()}
      </div>
    } else {
      return this.renderInstructions()
    }
  }

  render() {
    return (
      <div className="catalog-dashboard">
        <div className="catalog-dashboard__reader">
          <h1>Hello, {this.props.initials}</h1>
          <h2><I18n meaning="my_cases" /></h2>
        </div>
        {this.renderCasesOrInstructions()}
      </div>
    )
  }

}
