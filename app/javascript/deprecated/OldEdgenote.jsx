import React from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import Statistics from 'utility/Statistics'
import { activateEdgenote, updateEdgenote } from 'redux/actions'

const CONFIRMATION =
  'Are you sure you want to upgrade this edgenote to the new style? This cannot be undone. Note: it will not be displayed differently until all edgenotes for this card have been converted.'

const mapStateToProps = (state, { match, slug }) => {
  return {
    contents: state.edgenotesBySlug[slug],
    selected: slug === state.ui.highlightedEdgenote,
    active: slug === state.ui.activeEdgenote,
    editing: state.edit.inProgress,
    location: {
      pathname: `${match.url || ''}/edgenotes/${slug}`,
      state: {
        internalLink: true,
      },
    },
  }
}

const mapDispatchToProps = (dispatch, { slug }) => {
  return {
    deactivate: () => dispatch(activateEdgenote(null)),
    upgrade: e => {
      if (!window.confirm(CONFIRMATION)) return
      dispatch(updateEdgenote(slug, { style: 'v2' }))
      e.preventDefault()
    },
  }
}

class OldEdgenoteFigure extends React.Component {
  constructor () {
    super()
    this.state = { hovering: false }
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.active && this.props.active) {
      this.props.history.push(this.props.location)
      setTimeout(() => {
        this.props.deactivate()
      }, 300)
    }
  }

  className () {
    if (this.state.hovering) return 'Edgenote pop'
    else return 'Edgenote'
  }

  renderEdgenote () {
    let { slug, selected, contents, editing, upgrade } = this.props
    let { caption, format, statistics, thumbnailUrl, style } = contents
    let className = this.className()

    const linkDestination = style === 'v2' || editing ? {} : this.props.location

    return (
      <aside className="edgenotes">
        <Link
          to={linkDestination}
          className={className}
          onMouseOver={() => {
            this.setState({ hovering: true })
          }}
          onMouseOut={() => {
            this.setState({ hovering: false })
          }}
        >
          <div className="c-edgenote s-edgenote">
            <Statistics
              inline
              key={`edgenotes/${slug}`}
              uri={`edgenotes/${slug}`}
            />
            <div className="c-edgenote__cover">
              <img src={`${thumbnailUrl}?w=640`} />
            </div>
            <div
              className={`edgenote-icon edgenote-icon-${format}`}
              dangerouslySetInnerHTML={{
                __html: require(`images/edgenote-${format}.svg`),
              }}
            />
            <figcaption
              className={selected ? 'focus' : ''}
              dangerouslySetInnerHTML={{ __html: caption }}
            />
            {editing &&
              style === 'v1' && <button onClick={upgrade}>Upgrade</button>}
          </div>
        </Link>
      </aside>
    )
  }

  render () {
    if (!this.props.contents) return null
    return this.renderEdgenote()
  }
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(OldEdgenoteFigure)
)
