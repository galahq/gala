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
      case "H1": case "H2": case "H3": case "H4": case "H5": case "H6": case "BLOCKQUOTE":
        let innerHTML = {__html: paraNode.innerHTML}
        let element = React.createElement(paraNode.nodeName, {dangerouslySetInnerHTML: innerHTML})
        return <NonParagraph key={`P${index}`} contents={element} />
      case "P": case "UL": case "OL":
        return <Paragraph key={`P${index}`} contents={{__html: paraNode.outerHTML}} />
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
    this.state= {
      edgenotes: []
    }
  }

  downloadEdgenotes(contents) {
    var contentsNode = document.createElement('div')
    contentsNode.innerHTML = contents.__html
    var aNodes = contentsNode.querySelectorAll('a')
    let edgenoteStub = {
      "cover": <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/Canis_lupus_laying_in_grass.jpg" />,
      "caption": "Edgenote"
    }
    this.setState({edgenotes: mapNL(aNodes, () => {return edgenoteStub}) })
  }

  componentDidMount() {
    this.downloadEdgenotes(this.props.contents)
  }

  componentWillReceiveProps(nextProps) {
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
        <figcaption>{caption}</figcaption>
      </figure>
    )
  }
}
