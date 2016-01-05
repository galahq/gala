import React from 'react'

class Narrative extends React.Component {
  constructor() {
    super()
    this.state = {
      chapter: 0
    }
  }

  render() {
    if (this.props.chapters.length === 0) {
      return <article />
    }
    let chapter = this.props.chapters[this.state.chapter]
    return (
      <Chapter paragraphs={chapter} />
    )
  }
}

export default Narrative

class Chapter extends React.Component {
  render() {
    let paragraphs = this.props.paragraphs.map( (para) => {
      return <Paragraph contents={para} />
    } )
    return(
      <article>
        {paragraphs}
      </article>
    )
  }
}

class Paragraph extends React.Component {
  render() {
    let edgenotes = [
      {
        "cover": <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/Canis_lupus_laying_in_grass.jpg" />,
      "caption": "Edgenote"
      }, {
        "cover": <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Canis_lupus_howling_%28illustration%29.jpg" />,
      "caption": "Second"
      }
    ]
    let aside = edgenotes.map( (note) => {
      return <Edgenote contents={note} />
    } )
    return (
      <section>
        <Card contents={this.props.contents} />
        <aside>
          {aside}
        </aside>
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
