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
    let {title, coverURL, summary, caseAuthors, handleEdit} = this.props
    return (
      <section className="Billboard">
        <BillboardTitle title={title} coverURL={coverURL} caseAuthors={caseAuthors} handleEdit={handleEdit} />
        <div className="Card BillboardSnippet">
          <h3><I18n meaning="summary" /></h3>
          <p contentEditable={handleEdit !== null} onInput={this.prepareSave.bind(this)}>
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
      return <li><a target="_blank" href={activity.pdf_url}>{ activity.title }</a></li>
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

  renderPodcast() {
    let podcasts = this.props.podcasts
    let list = podcasts.map( (podcast) => {
      return <a href={podcast.audio_url}>{podcast.title}</a>
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

  renderUnlessEditing(component) {
    if (this.props.handleEdit === null) {
      return component
    }
  }

  render() {
    return (
      <aside className="Actions">

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
            segmentTitles={this.props.segmentTitles}
            currentSegment={null}
            handleEdit={this.props.handleEdit}
          />
        </div>

      {this.renderPodcast()}

      {this.renderUnlessEditing(
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

      {this.renderUnlessEditing(
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
