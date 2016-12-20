import React from 'react'
import { connect } from 'react-redux'
import {Link} from 'react-router'
import {Orchard} from 'concerns/orchard.js'
import {Statistics} from 'Statistics.js'

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    contents: state.edgenotesBySlug[ownProps.slug],
    selected: ownProps.slug === state.ui.highlightedEdgenote
  }
}

class OldEdgenoteFigure extends React.Component {

  constructor() {
    super()
    this.state = { hovering: false }
  }

  createEdgenote() {
    Orchard.graft(`cases/${this.props.caseSlug}/edgenotes`, {slug: this.props.slug}).then(this.parseContentsFromJSON.bind(this))
  }

  className() {
    if (this.state.hovering)
      return "Edgenote pop"
    else
      return "Edgenote"
  }

  renderEdgenote() {
    let {selected, contents, slug, pathPrefix} = this.props
    let {caption, format, statistics, thumbnailUrl} = contents
    let className = this.className()

    return <Link
      to={`${pathPrefix || ""}/edgenotes/${slug}`}
      className={className}
      onMouseOver={() => {this.setState({hovering: true})}}
      onMouseOut={() => {this.setState({hovering: false})}}
    >
      <div className="c-edgenote s-edgenote">
        <Statistics statistics={statistics} inline={true} />
        <div className="c-edgenote__cover">
          <img src={`${thumbnailUrl}?w=640`} />
        </div>
        <div
          className={`edgenote-icon edgenote-icon-${format}`}
          dangerouslySetInnerHTML={{__html: require(`../assets/images/react/edgenote-${format}.svg`)}}
        />
        <figcaption className={ selected ? "focus" : "" } dangerouslySetInnerHTML={{__html: caption}} />
      </div>
    </Link>
  }

  render() {
    if (this.props.contents !== null) {
      return this.renderEdgenote()
    } else {
      return <button onClick={this.createEdgenote.bind(this)}>{`Create ${this.props.slug} Edgenote`}</button>
    }
  }
}

const OldEdgenote = connect(mapStateToProps)(OldEdgenoteFigure)
export default OldEdgenote
