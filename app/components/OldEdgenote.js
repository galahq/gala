import React from 'react'
import { connect } from 'react-redux'
import {Link} from 'react-router'
import {Orchard} from 'concerns/orchard.js'
import Statistics from 'Statistics.js'
import {
  activateEdgenote,
  updateEdgenote,
} from 'redux/actions.js'

const CONFIRMATION = "Are you sure you want to upgrade this edgenote to the new style? This cannot be undone. Note: it will not be displayed differently until all edgenotes for this card have been converted."

const mapStateToProps = (state, {slug}) => {
  return {
    contents: state.edgenotesBySlug[slug],
    selected: slug === state.ui.highlightedEdgenote,
    active: slug === state.ui.activeEdgenote,
    editing: state.edit.inProgress,
  }
}

const mapDispatchToProps = (dispatch, {slug}) => {
  return {
    deactivate: () => dispatch(activateEdgenote(null)),
    upgrade: e => {
      if (!window.confirm(CONFIRMATION))  return
      dispatch(updateEdgenote(slug, {style: 'v2'}))
      e.preventDefault()
    },
  }
}

class OldEdgenoteFigure extends React.Component {

  constructor() {
    super()
    this.state = { hovering: false }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.active && this.props.active) {
      window.location.hash = `#${this.props.pathPrefix || ""}/edgenotes/${this.props.slug}`
      setTimeout(() => {this.props.deactivate()}, 300)
    }
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
    let {selected, contents, slug, pathPrefix, editing, upgrade} = this.props
    let {caption, format, statistics, thumbnailUrl, style} = contents
    let className = this.className()

    const linkDestination = style === "v2" || editing
      ? pathPrefix
      : `${pathPrefix || ""}/edgenotes/${slug}`

    return <Link
      to={linkDestination}
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
        {editing && style === 'v1' && <button onClick={upgrade}>Upgrade</button>}
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

const OldEdgenote = connect(mapStateToProps, mapDispatchToProps)(OldEdgenoteFigure)
export default OldEdgenote
