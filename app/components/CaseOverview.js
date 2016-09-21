import React from 'react';
import { Link } from 'react-router'
import TableOfContents from 'TableOfContents.js'
import BillboardTitle from 'BillboardTitle.js'
import {I18n} from 'I18n.js'
import {Editable} from 'Editable.js'
import {EditableList} from 'EditableList.js'

export class Billboard extends React.Component {
  render() {
    let {dek, summary, didSave} = this.props
    let endpoint = `cases/${this.props.slug}`
    return (
      <section className="Billboard">
        <BillboardTitle {...this.props} />
        <div className="Card BillboardSnippet">
          <Editable uri={`${endpoint}:dek`} didSave={didSave}><h3>{dek}</h3></Editable>
          <Editable uri={`${endpoint}:summary`} didSave={didSave}><p>{summary}</p></Editable>
        </div>
      </section>
    )
  }
}

class Actions extends React.Component {

  renderConsiderLinks() {
    let activities = this.props.activities

    let list = this.props.activities.map( (activity) => {
      return <a href={activity.pdfUrl}>{ activity.title }</a>
    } )
    if ((activities && activities.length !== 0) || this.props.didSave !== null) {
      return (
        <div>
          <h2>
            <div
              className="ActionIcon"
              dangerouslySetInnerHTML={{__html: require('consider.svg')}}
            />
            <I18n meaning="consider"/>
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
    let podcasts = this.props.podcasts
    let list = podcasts.map( (pod) => {
        return <Link key={`podcast-${pod.position}`} to={`podcasts/${pod.position}`}>{pod.title}</Link>
    } )
    if ((podcasts && podcasts.length !== 0) || this.props.didSave !== null) {
      return (
        <div>
          <h2>
            <div
              className="ActionIcon"
              dangerouslySetInnerHTML={{__html: require('listen.svg')}}
            />
            <I18n meaning="listen" />
          </h2>
          <h4 className="list-head"><I18n meaning="related_podcast" /></h4>
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

  renderSignInForm() {
    if (this.props.signInForm !== undefined) {
      return <div className="dialog" dangerouslySetInnerHTML={{__html: this.props.signInForm}} />
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

        {this.renderSignInForm()}

        <div className={`Actions ${this.props.reader === undefined ? "disabled" : ""}`}>
          <div>
            <h2>
              <div
                className="ActionIcon"
                dangerouslySetInnerHTML={{__html: require('read.svg')}}
              />
              <I18n meaning="read" />
            </h2>
            <TableOfContents
              slug={this.props.slug}
              pageTitles={pageTitles}
              currentPage={null}
              didSave={this.props.didSave}
            />
          </div>

        {this.renderPodcasts()}

        {this.renderIfReading(
          <div>
            <h2>
              <div
                className="ActionIcon"
                dangerouslySetInnerHTML={{__html: require('explore.svg')}}
              />
              <I18n meaning="explore" />
            </h2>
            <Link to={`/edgenotes`}><I18n meaning="edgenote_gallery" /></Link>
          </div>
        )}

        {this.renderConsiderLinks()}

        {this.renderIfReading(
          <div>
            <h2>
              <div
                className="ActionIcon"
                dangerouslySetInnerHTML={{__html: require('respond.svg')}}
              />
              <I18n meaning="respond" />
            </h2>
            <a href="http://goo.gl/forms/32tzg5yZTd" target="_blank"><I18n meaning="give_feedback" /></a>
          </div>
        )}

      </div>
    </aside>
    )
  }
}

export class CaseOverview extends React.Component {
  render () {
    return (
      <div id="CaseOverview" className={ `window ${this.props.didSave !== null ? 'editing' : ''}` }>
        <Billboard {...this.props} />
        <Actions {...this.props} />
      </div>
    )
  }
}
