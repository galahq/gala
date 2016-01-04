import React from 'react'

class Narrative extends React.Component {
  render() {
    let sections = this.props.sections.map( (section, i) => {
      return <Section key={i} contents={section} />
    })
    return (
      <article>
        {sections}
      </article>
    )
  }
}

export default Narrative

class Section extends React.Component {
  render() {
    /* TODO: Generate from <a> tags */
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
      <div className="Card">
        {this.props.contents}
      </div>
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
