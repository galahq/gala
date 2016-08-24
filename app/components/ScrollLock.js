import React from 'react'
import ReactDOM from 'react-dom'

/**
 * Prevent default behavior for event
 *
 * @param e
 * @returns {boolean}
 */
var cancelScrollEvent = function (e) {
  e.stopImmediatePropagation()
  e.preventDefault()
  e.returnValue = false
  return false
}

var addScrollEventListener = function (elem, handler) {
  elem.addEventListener('wheel', handler, false)
}

var removeScrollEventListener = function (elem, handler) {
  elem.removeEventListener('wheel', handler, false)
}

export var ScrollLock = ComposedComponent => class extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.scrollLock()
  }

  componentDidUpdate() {
    this.scrollLock()
  }

  componentWillUnmount() {
    this.scrollRelease()
  }

  scrollLock() {
    var elem = ReactDOM.findDOMNode(this)
    if (elem) {
      addScrollEventListener(elem, this.onScrollHandler)
    }
  }

  scrollRelease() {
    var elem = ReactDOM.findDOMNode(this)
    if (elem) {
      removeScrollEventListener(elem, this.onScrollHandler)
    }
  }

  onScrollHandler(e) {
    var elem = ReactDOM.findDOMNode(this).querySelector('.scrolling')
    var scrollTop = elem.scrollTop;
    var scrollHeight = elem.scrollHeight;
    var height = elem.clientHeight;
    var wheelDelta = e.deltaY;
    var isDeltaPositive = wheelDelta > 0;

    if (isDeltaPositive && wheelDelta > scrollHeight - height - scrollTop) {
      elem.scrollTop = scrollHeight;
      return cancelScrollEvent(e);
    }
    else if (!isDeltaPositive && -wheelDelta > scrollTop) {
      elem.scrollTop = 0;
      return cancelScrollEvent(e);
    }
  }

  render() {
    return <ComposedComponent {...this.props} />;
  }
}
