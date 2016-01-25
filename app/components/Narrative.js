import React from 'react'
import mapNL from '../mapNL.js'
import Edgenote from './Edgenote.js'
import '../stylesheets/Narrative.scss';

class Narrative extends React.Component {
  render() {
    if (this.props.chapters.length === 0) {
      return <article />
    }
    let chapter = this.props.chapters[this.props.params.chapter].contents
    return (
      <Chapter paragraphs={chapter} />
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
        return <Paragraph id={index} key={`P${index}`} contents={paraNode.outerHTML} />
      case "UL": case "OL": case "BLOCKQUOTE": case "SECTION":
        return <Paragraph id={index} key={`P${index}`} contents={paraNode.innerHTML} />
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

class Paragraph extends React.Component {
  constructor() {
    super()
    this.state = {
      selected_id: 0,
      edgenotes: []
    }
  }

  edgenoteCoverImage(response) {
    if (response.better_featured_image !== null) {
      return <img src={response.better_featured_image.source_url} />
    } else {
      return <img />
    }
  }

  parseEdgenoteFromJSON(response) {
    let e = {
      "id": response.id,
      "caption": {__html: response.title.rendered},
      "cover": this.edgenoteCoverImage(response),
      "format": response.format
    }
    return e
  }

  downloadEdgenote(a, i) {
    let url = a.getAttribute("href")
    let post_id = /p=([^&]+)/.exec(url)[1]
    $.ajax({
      type: 'GET',
      url: 'http://remley.wcbn.org/ihih-msc/index.php',
      data: [
        {name: 'rest_route', value: `/wp/v2/posts/${post_id}`}
      ],
      dataType: 'json',
      success: (response) => {
        let edgenotes = this.state.edgenotes
        edgenotes[i] = this.parseEdgenoteFromJSON(response)
        this.setState({edgenotes: edgenotes})
      }
    })
  }

  addHoverCallbacksToParagraphText(paragraph) {
    let mouseover = 'onmouseover="window.handleHover'+this.props.id+'($2)"'
    let mouseout = 'onmouseout="window.handleHover'+this.props.id+'(0)"'
    return { __html: paragraph.addAttributeToLinks(mouseover).addAttributeToLinks(mouseout) }
  }

  downloadEdgenotes(contents) {
    var contentsNode = document.createElement('div')
    contentsNode.innerHTML = contents
    var aNodes = contentsNode.querySelectorAll('a')
    mapNL(aNodes, (a, i) => {this.downloadEdgenote(a, i)})
  }

  componentWillMount() {
    window["handleHover"+this.props.id] = (id) => {
      this.setState({selected_id: id})
    }
  }

  componentDidMount() {
    this.downloadEdgenotes(this.props.contents)
  }

  componentWillReceiveProps(nextProps) {
    this.setState( { edgenotes: [] } )
    this.downloadEdgenotes(nextProps.contents)
  }

  renderEdgenotes() {
    let aside
    if (this.state.edgenotes.length != 0) {
      aside = <aside>
                {
                  this.state.edgenotes.map( (note, idx) => {
                    return <Edgenote selected_id={this.state.selected_id} contents={note} key={`${note}${idx}`} handleHoverID={this.props.id} />
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
