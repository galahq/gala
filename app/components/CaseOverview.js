import React from 'react'
import { connect } from 'react-redux'

import { Link } from 'react-router'

import { FormattedMessage } from 'react-intl'

import TableOfContents from 'TableOfContents.js'
import Billboard from 'Billboard.js'
import {Editable, EditableAttribute} from 'Editable.js'
import {EditableList} from 'EditableList.js'
import EnrollForm from 'EnrollForm.js'

class Actions extends React.Component {

  renderConsiderLinks() {
    let activities = this.props.activities

    let list = this.props.activities.map( (activity) => {
      return [
        <Editable placeholder="Activity name"
          uri={`activities/${activity.id}:title`} didSave={this.props.didSave}><a
          href={activity.pdfUrl}>{ activity.title }</a></Editable>,
        <div><EditableAttribute placeholder="Activity URL"
          uri={`activities/${activity.id}:pdf_url`}
          didSave={this.props.didSave}>{activity.pdfUrl}</EditableAttribute></div>
      ]

    } )
    if ((activities && activities.length !== 0) || this.props.didSave !== null) {
      return (
        <div>
          <h2>
            <div
              className="ActionIcon"
              dangerouslySetInnerHTML={{__html: require('consider.svg')}}
            />
            <FormattedMessage id="overview.consider"/>
          </h2>
          <EditableList
            elements={list}
            ordered={false}
            uri={`cases/${this.props.slug}/activities`}
            didSave={this.props.didSave}
          />
        </div>
      )
    }
  }

  renderPodcasts() {
    if (this.props.reader && this.props.reader.enrollment &&
        this.props.reader.enrollment.status === "treatment") {
      return null
    }

    let podcasts = this.props.podcasts
    let edit = this.props.didSave !== null ? "edit/" : ""
    let list = podcasts.map( (pod) => {
        return <Link key={`podcast-${pod.position}`} to={`${edit}podcasts/${pod.position}`}>{pod.title}</Link>
    } )
    if ((podcasts && podcasts.length !== 0) || this.props.didSave !== null) {
      return (
        <div>
          <h2>
            <div
              className="ActionIcon"
              dangerouslySetInnerHTML={{__html: require('listen.svg')}}
            />
            <FormattedMessage id="overview.listen" />
          </h2>
          <h3 className="list-head">
            <FormattedMessage id="overview.relatedPodcast" />
          </h3>
          <EditableList
            elements={list}
            ordered={false}
            uri={`cases/${this.props.slug}/podcasts`}
            didSave={this.props.didSave}
          />
        </div>
      )
    }
  }

  renderForm() {
    if (this.props.signInForm !== undefined) {
      return <div className="dialog" dangerouslySetInnerHTML={{__html: this.props.signInForm}} />
    } else if (!this.props.reader.enrollment) {
      return <EnrollForm />
    }
  }

  renderIfReading(component) {
    if (this.props.didSave === null && this.props.reader !== undefined) {
      return component
    }
  }

  render() {
    let pageTitles = this.props.pages.map( (p) => { return p.title } )
    return (
      <aside className="CaseOverviewRight">

        {this.renderForm()}

        <div className={`Actions ${this.props.reader === undefined ? "disabled" : ""}`}>
          <div>
            <h2>
              <div
                className="ActionIcon"
                dangerouslySetInnerHTML={{__html: require('read.svg')}}
              />
              <FormattedMessage id="overview.read" />
            </h2>
            <TableOfContents
              slug={this.props.slug}
              pageTitles={pageTitles}
              currentPage={null}
              didSave={this.props.didSave}
            />
          </div>

        {this.renderPodcasts()}

        {//this.renderIfReading(
          //<div>
            //<h2>
              //<div
                //className="ActionIcon"
                //dangerouslySetInnerHTML={{__html: require('explore.svg')}}
              ///>
              //<FormattedMessage id="overview.explore" />
            //</h2>
            //<Link to={`/edgenotes`}>
              //<FormattedMessage id="overview.edgenoteGallery" />
            //</Link>
          //</div>
        //)
        }

        {this.renderConsiderLinks()}

        {this.renderIfReading(
          <div>
            <h2>
              <div
                className="ActionIcon"
                dangerouslySetInnerHTML={{__html: require('respond.svg')}}
              />
              <FormattedMessage id="overview.respond" />
            </h2>
            <a href="http://goo.gl/forms/32tzg5yZTd" target="_blank">
              <FormattedMessage id="overview.giveFeedback" />
            </a>
          </div>
        )}

      </div>
    </aside>
    )
  }
}

const CaseOverview = (props) => {
  let { editing } = props
  return <div id="CaseOverview" className={`window ${editing && 'editing'}`}>
    <Billboard />
    <Actions {...props} />
  </div>
}

export default connect(
  (state, ownProps) => ({
    reader: {
      ...ownProps.reader,
      enrollment: state.caseData.reader && state.caseData.reader.enrollment,
    },
  })
)(CaseOverview)
