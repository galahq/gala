import React from 'react'
import Edgenote from './Edgenote.js'
import {Link} from 'react-router'
import gatherEdgenotes from '../gatherEdgenotes.js';
import {I18n} from './I18n.js'

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
    let nextChapterID = this.props.selectedSegment + 2
    if (nextChapterID - 1 < this.props.segmentContents.length) {
      return <Link className="nextLink" to={`/${nextChapterID}`}><I18n meaning="next" /> {this.props.segmentTitles[nextChapterID - 1]}</Link>
    } else {
      return <footer><h2><I18n meaning="end" /></h2></footer>
    }
  }

  render() {
    let i = this.props.selectedSegment
    if (this.props.segmentContents.length === 0) {
      return <article />
    }
    let segment = this.props.segmentContents[i]
    return (
      <main>
        <a id="top" />
        <Chapter selectedSegment={i} segmentTitle={this.props.segmentTitles[i]} paragraphs={segment} />
        {this.nextLink()}
      </main>
    )
  }
}

export default Narrative

class Chapter extends React.Component {
  renderParagraph(paraNode, index) {
    switch (paraNode.nodeName){
      case "H1": case "H2": case "H3": case "H4": case "H5": case "H6":
        let innerHTML = {__html: paraNode.innerHTML}
        let element = React.createElement(paraNode.nodeName, {dangerouslySetInnerHTML: innerHTML})
        return <NonParagraph key={`P${index}`} contents={element} />
      case "P":
        return <Paragraph selectedSegment={this.props.selectedSegment} id={index} key={`P${index}`} contents={paraNode.outerHTML} />
      case "UL": case "OL": case "BLOCKQUOTE": case "SECTION":
        return <Paragraph selectedSegment={this.props.selectedSegment} id={index} key={`P${index}`} contents={paraNode.innerHTML} />
    }
  }

  render() {
    let paragraphs = this.props.paragraphs.map( (para, i) => {
      return this.renderParagraph(para, i)
    } )
    return(
      <article>
        <NonParagraph contents={<h1>{this.props.segmentTitle}</h1>} />
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
  return this.replace(/(<a data-edgenote=\"([a-zA-Z0-9-]+)\")/g, '$1 ' + attribute)
}

String.prototype.addAttributeToLinksPointingToEdgenoteID = function (id, attribute) {
  return this.replace(new RegExp('(<a data-edgenote=\"'+id+'\")', 'g'), '$1 ' + attribute)
}

String.prototype.addHREF = function(firstPartOfPath) {
  return this.addAttributeToLinks(`href=\"#${firstPartOfPath}/edgenotes/$2\"`)
}

class Paragraph extends React.Component {
  constructor() {
    super()
    this.state = {
      selectedEdgenote: null,
      edgenoteSlugs: []
    }
  }

  addHoverCallbacksToParagraphText(paragraph) {
    let mouseover = 'onmouseover=\'window.handleHover'+this.props.id+'(\"$2\")\''
    let mouseout = 'onmouseout=\'window.handleHover'+this.props.id+'(null)\''
    return { __html: paragraph.addAttributeToLinks(mouseover).addAttributeToLinks(mouseout)
      .addHREF(`/${this.props.selectedSegment + 1}`) }
  }

  setEdgenotes(contents) {
    let edgenoteSlugs = gatherEdgenotes(contents)
    this.setState({edgenoteSlugs: edgenoteSlugs})
  }

  componentWillMount() {
    window["handleHover"+this.props.id] = (slug) => {
      this.setState({selectedEdgenote: slug})
    }
  }

  componentDidMount() {
    this.setEdgenotes(this.props.contents)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedSegment !== nextProps.selectedSegment) {
      this.setState({ edgenoteSlugs: [] })
      this.setEdgenotes(nextProps.contents)
    }
  }

  renderEdgenotes() {
    let aside
    if (this.state.edgenoteSlugs.length != 0) {
      aside = <aside className="edgenotes">
                {
                  this.state.edgenoteSlugs.map( (slug) => {
                    return (
                      <Edgenote
                        pathPrefix={`/${this.props.selectedSegment + 1}`}
                        selectedEdgenote={this.state.selectedEdgenote}
                        slug={slug}
                        key={`edgenote_${slug}`}
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
