import React from 'react'
import Edgenote from './Edgenote.js'
import {Link} from 'react-router'
import gatherEdgenotes from '../gatherEdgenotes.js';

function isElementInViewport (el) {

  //special bonus for those using jQuery
  if (typeof jQuery === "function" && el instanceof jQuery) {
    el = el[0];
  }

  var rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
      rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
  );
}

class Narrative extends React.Component {
  componentDidUpdate() {
    let top = document.getElementById('top');
    if (top && window.innerWidth < 749) {top.scrollIntoView()}
  }

  nextLink() {
    let nextChapterID = parseInt(this.props.params.chapter) + 1
    if (nextChapterID < this.props.chapters.length) {
      return <Link className="nextLink" to={`/read/${this.props.params.id}/${nextChapterID}`}>Next: {this.props.chapterTitles[nextChapterID]}</Link>
    } else {
      return <footer><h2>End</h2></footer>
    }
  }

  render() {
    if (this.props.chapters.length === 0) {
      return <article />
    }
    let chapter = this.props.chapters[this.props.params.chapter].contents
    return (
      <main>
        <a id="top" />
        <Chapter params={this.props.params} paragraphs={chapter} />
        {this.nextLink()}
      </main>
    )
  }
}

export default Narrative

class Chapter extends React.Component {
  renderParagraph(paraNode, index) {
    let params = this.props.params
    switch (paraNode.nodeName){
      case "H1": case "H2": case "H3": case "H4": case "H5": case "H6":
        let innerHTML = {__html: paraNode.innerHTML}
        let element = React.createElement(paraNode.nodeName, {dangerouslySetInnerHTML: innerHTML})
        return <NonParagraph key={`P${index}`} contents={element} />
      case "P":
        return <Paragraph params={params} id={index} key={`P${index}`} contents={paraNode.outerHTML} />
      case "UL": case "OL": case "BLOCKQUOTE": case "SECTION":
        return <Paragraph params={params} id={index} key={`P${index}`} contents={paraNode.innerHTML} />
    }
  }

  render() {
    let paragraphs = this.props.paragraphs.map( (para, i) => {
      return this.renderParagraph(para, i)
    } )
    return(
      <article>
        {paragraphs}
      </article>
    )
  }
}

class NonParagraph extends React.Component {
  render() {
    return (
      <section>
        {this.props.contents}
      </section>
    )
  }
}

String.prototype.addAttributeToLinks = function (attribute) {
  return this.replace(/(<a href=\"[^ ]*[?&]p=([0-9]+)\")/g, '$1 ' + attribute)
}

String.prototype.addAttributeToLinksPointingToEdgenoteID = function (id, attribute) {
  return this.replace(new RegExp('(<a href=\"[^ ]*[?&]p='+id+'\")', 'g'), '$1 ' + attribute)
}

String.prototype.removeHREFContents = function() {
  return this.replace(/href=\"[^ ]*\"/g, "")
}
String.prototype.replaceHREFContents = function(firstPartOfPath) {
  return this.replace(/href=\"[^ ]*[?&]p=([0-9]+)\"/g, `href=\"${firstPartOfPath}/edgenotes/$1\"`)
}

class Paragraph extends React.Component {
  constructor() {
    super()
    this.state = {
      selected_id: 0,
      edgenote_ids: []
    }
  }

  addHoverCallbacksToParagraphText(paragraph) {
    let mouseover = 'onmouseover="window.handleHover'+this.props.id+'($2)"'
    let mouseout = 'onmouseout="window.handleHover'+this.props.id+'(0)"'
    return { __html: paragraph.addAttributeToLinks(mouseover).addAttributeToLinks(mouseout).replaceHREFContents(`/read/${this.props.params.id}/${this.props.params.chapter}`) }
  }

  setEdgenotes(contents) {
    let edgenote_ids = gatherEdgenotes(contents)
    this.setState({edgenote_ids: edgenote_ids})
  }

  componentWillMount() {
    window["handleHover"+this.props.id] = (id) => {
      this.setState({selected_id: id})
    }
  }

  componentDidMount() {
    this.setEdgenotes(this.props.contents)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.id !== nextProps.params.id || this.props.params.chapter !== nextProps.params.chapter) {
      this.setState({ edgenote_ids: [] })
      this.setEdgenotes(nextProps.contents)
    }
  }

  renderEdgenotes() {
    let aside
    if (this.state.edgenote_ids.length != 0) {
      aside = <aside className="edgenotes">
                {
                  this.state.edgenote_ids.map( (id) => {
                    return (
                      <Edgenote
                        path_prefix={`/read/${this.props.params.id}/${this.props.params.chapter}`}
                        selected_id={this.state.selected_id}
                        id={id}
                        key={`edgenote_${id}`}
                        handleHoverID={this.props.id}
                      />
                      )
                    } )
                }
              </aside>
    }
    return aside
  }

  render() {
    //let paragraph = this.props.contents.addAttributeToLinksPointingToEdgenoteID(this.state.selected_id, 'class="focus"')
    let paragraph = this.props.contents
    return (
      <section>
        <Card contents={this.addHoverCallbacksToParagraphText(paragraph)} />
        {this.renderEdgenotes()}
      </section>
    )
  }
}

class Card extends React.Component {
  render () {
    return (
      <div className="Card" dangerouslySetInnerHTML={this.props.contents} />
    )
  }
}
