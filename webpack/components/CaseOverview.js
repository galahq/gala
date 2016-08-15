import React from 'react';
import { Link } from 'react-router'
import TableOfContents from './TableOfContents.js'
import BillboardTitle from './BillboardTitle.js'
import {I18n} from './I18n.js'

export class Billboard extends React.Component {

  prepareSave(e) {
    this.props.handleEdit("summary", e.target.innerText)
  }

  render() {
    let {kicker, title, dek, coverUrl, summary, caseAuthors, translators, handleEdit} = this.props
    return (
      <section className="Billboard">
        <BillboardTitle
          kicker={kicker}
          title={title}
          translators={translators}
          coverUrl={coverUrl}
          caseAuthors={caseAuthors}
          handleEdit={handleEdit}
        />
        <div className="Card BillboardSnippet">
          <h3>{dek}</h3>
          <p contentEditable={handleEdit !== null} onBlur={this.prepareSave.bind(this)}>
            {summary}
          </p>
        </div>
      </section>
    )
  }
}

class Actions extends React.Component {

  renderConsiderLinks() {
    let activities = this.props.activities

    let list = this.props.activities.map( (activity) => {
      return <li><a target="_blank" href={activity.pdfUrl}>{ activity.title }</a></li>
    } )
    if ((activities && activities.length !== 0) || this.props.handleEdit !== null) {
      return (
        <div>
          <h2>
            <div
              className="ActionIcon"
              dangerouslySetInnerHTML={{__html: require('../images/consider.svg')}}
            />
            <I18n meaning="consider"/>
          </h2>
          <ul>
            {list}
          </ul>
        </div>
      )
    }
  }

  renderPodcasts() {
    let podcasts = this.props.podcasts
    let list = podcasts.map( (pod) => {
        return <Link key={`podcast-${pod.position}`} to={`podcasts/${pod.position}`}>{pod.title}</Link>
    } )
    if ((podcasts && podcasts.length !== 0) || this.props.handleEdit !== null) {
      return (
        <div>
          <h2>
            <div
              className="ActionIcon"
              dangerouslySetInnerHTML={{__html: require('../images/listen.svg')}}
            />
            <I18n meaning="listen" />
          </h2>
          <h4 className="list-head"><I18n meaning="related_podcast" /></h4>
          {list}
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
    if (this.props.handleEdit === null && this.props.reader !== undefined) {
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
                dangerouslySetInnerHTML={{__html: require('../images/read.svg')}}
              />
              <I18n meaning="read" />
            </h2>
            <TableOfContents
              slug={this.props.slug}
              pageTitles={pageTitles}
              currentPage={null}
              handleEdit={this.props.handleEdit}
            />
          </div>

        {this.renderPodcasts()}

        {this.renderIfReading(
          <div>
            <h2>
              <div
                className="ActionIcon"
                dangerouslySetInnerHTML={{__html: require('../images/explore.svg')}}
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
                dangerouslySetInnerHTML={{__html: require('../images/respond.svg')}}
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
      <div id="CaseOverview" className={ `window ${this.props.handleEdit !== null ? 'editing' : ''}` }>
        <Billboard {...this.props} />
        <Actions {...this.props} />
      </div>
    )
  }
}
