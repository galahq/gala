import React from 'react'
import '../stylesheets/Narrative.scss';

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
    let edgenotes = [{
      "cover": <img />,
      "caption": "Edgenote"
    }]
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
