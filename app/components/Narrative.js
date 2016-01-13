import React from 'react'
import mapNL from '../mapNL.js'

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
      case "P": case "UL": case "OL": case "BLOCKQUOTE": case "SECTION":
        return <Paragraph key={`P${index}`} contents={{__html: paraNode.innerHTML}} />
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


class Paragraph extends React.Component {
  constructor() {
    super()
    this.state = {
      edgenotes: []
    }
  }

  parseEdgenoteFromJSON(response) {
    let e = {
    "caption": {__html: response.title.rendered},
    "cover": <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/Canis_lupus_laying_in_grass.jpg" />
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

  downloadEdgenotes(contents) {
    var contentsNode = document.createElement('div')
    contentsNode.innerHTML = contents.__html
    var aNodes = contentsNode.querySelectorAll('a')
    mapNL(aNodes, (a, i) => {this.downloadEdgenote(a, i)})
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
                    return <Edgenote contents={note} key={`${note}${idx}`} />
                    } )
                }
              </aside>
    }
    return aside
  }

  render() {
    return (
      <section>
        <Card contents={this.props.contents} />
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

class Edgenote extends React.Component {
  render () {
    let {cover, caption} = this.props.contents
    return (
      <figure>
        <div>{cover}</div>
        <figcaption dangerouslySetInnerHTML={caption} />
      </figure>
    )
  }
}
