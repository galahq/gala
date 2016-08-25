import React from 'react'
import {Link} from 'react-router'
import {ScrollLock} from 'ScrollLock.js'
import {orchard} from 'concerns/orchard.js'

class EdgenoteContents extends React.Component {

  constructor() {
    super()
    this.state = {
      content: null
    }
  }

  componentDidMount() {
    orchard(`edgenotes/${this.props.params.edgenoteID}`).then(this.parseContentsFromJSON.bind(this))
    $(document).on('keydown', (e) => {
      if (e.which === 27) {
        $(document).off('keydown')
        this.props.history.push(this.returnLink())
      }
    })
  }

  parseContentsFromJSON(r) {
    this.setState({
      caption: r.caption,
      content: r.content,
      instructions: r.instructions,
      format: r.format,
      url: r.url
    })
  }

  returnLink() {
    if (this.props.params.selectedPage) {
      return `/${this.props.params.selectedPage}`
    } else {
      return `/edgenotes`
    }
  }

  render() {
    return (
      <div className="EdgenoteContents">
        <Link to={this.returnLink()} className="dismiss EdgenoteContents-dismiss">
          &nbsp;
        </Link>
        <aside className="EdgenoteContents-window">
          <EdgenoteDisplay {...this.state} />
          <EdgenoteSidebar {...this.state} />
        </aside>
      </div>
    )
  }

}

export default ScrollLock(EdgenoteContents, ".EdgenoteContents-window")

class EdgenoteDisplay extends React.Component {

  renderContent() {
    switch(this.props.format) {
    //case "link":
      //return <a href={this.props.url} target="_blank">
        //<img src={this.props.thumbnailUrl} />
      //</a>
    default:
      return <img src={this.props.url} />
    }
  }

  render() {
    return <div className="EdgenoteDisplay">
      {this.renderContent()}
    </div>
  }

}

class EdgenoteSidebar extends React.Component {

  renderFormatIcon() {
    let {format} = this.props
    if (format !== undefined) {
      return (
        <div
          className={`edgenote-icon edgenote-icon-${format}`}
          dangerouslySetInnerHTML={{__html: require(`../assets/images/react/edgenote-${format}.svg`)}}
        />
      )
    }
  }

  render() {
    return <div className="EdgenoteSidebar">
      <section className="EdgenoteSidebar-meta">
        <div>
          {this.renderFormatIcon()}
          <h4>{this.props.caption}</h4>
        </div>
        <p>{this.props.instructions}</p>
      </section>
      <aside className="CommentThread scrolling">
        <div className="Comment">
          <cite>ARMAN GOLROKHIAN</cite>
          <i>07/06/2015 4:35 PM NEW YORK, NY</i>
          <blockquote>
            This is really interesting in light of some recent research by Obama, Biden, et al. (2016) which suggests that it might be better to use a model based on diachronic transformations. That insight, applied here, would suggest that collusion would be a better choice.
          </blockquote>
        </div>
        <div className="Comment">
          <cite>KATIE BROWNE</cite>
          <i>07/06/2015 7:12 PM DAKAR, SENEGAL</i>
          <blockquote>
            I think it could be seen as an interaction between the various polarities of each node in the value network. After all, it’s not so simple as black or white in this field. CI made this decision after a lot of research, and in light of all the complexity here it can barely be blamed.
          </blockquote>
        </div>
        <form>
          <label for="CommentSubmit">Cameron Bothner</label><br />
          <div id="CommentSubmit">
            <input type="text" placeholder="Write a reply..." />
            <button type="submit">Submit</button>
          </div>
        </form>
      </aside>
    </div>
  }

}
