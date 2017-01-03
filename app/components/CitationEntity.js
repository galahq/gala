import React from 'react'  // eslint-disable-line no-unused-vars
import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
  return {
    isOpen: state.ui.openCitation === ownProps.entityKey
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    open: () => {dispatch({type: 'OPEN_CITATION', entityKey: ownProps.entityKey})},
    close: () => {dispatch({type: 'OPEN_CITATION', entityKey: null})}
  }
}

class CitationSpan extends React.Component {
  render() {
    let {isOpen, open, close } = this.props

    let citationLabel = isOpen ? '×' : '◦'
    let toggle = isOpen ? close : open
    return <span style={styles.label} onClick={toggle}>
      <sup ref={e => this.label = e}>{citationLabel}</sup>
      {isOpen && this.renderTooltip()}
    </span>
  }

  renderTooltip() {
    let {href, contents} = this.props.contentState.getEntity(this.props.entityKey).getData()
    return <cite style={this.getTooltipStyles()}>
      {contents}
      {" "}
      <a href={href} target="_blank">Read&nbsp;more&nbsp;›</a>
    </cite>
  }

  getTooltipStyles() {
    let left = this.label.offsetLeft
    let top = this.label.offsetTop

    return {
      ...styles.tooltip,
      position: 'absolute',
      left: left,
      top: top,
      transform: "translate(-50%, calc(-100% + 6px))"
    }
  }
}

const CitationEntity = connect(mapStateToProps, mapDispatchToProps)(CitationSpan)

export default CitationEntity


const styles = {
  label: {
    color: '#4a8e50',
    cursor: 'pointer',
    display: 'inline-block',
    marginLeft: -2,
    width: 8
  },
  tooltip: {
    background: "#6ACB72",
    borderRadius: 2,
    boxShadow: "0 0 10px rgba(black, 0.2)",
    color: 'black',
    display: 'block',
    font: "14px tenso",
    maxWidth: "20em",
    padding: "0.25em 0.5em"
  }
}
