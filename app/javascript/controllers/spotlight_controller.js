/**
 * @noflow
 */

import { Controller } from 'stimulus'
import * as React from 'react'
import { render } from 'react-dom'
import Spotlight from 'shared/spotlight'
import mergeRefs from 'utility/mergeRefs'

export default class extends Controller {
  get key () {
    return this.data.get('key')
  }

  get content () {
    return this.data.get('content')
  }

  get placement () {
    return this.data.get('placement') || undefined
  }

  connect () {
    this.children = [...this.element.children]

    render(
      <ThievingSpotlight
        content={this.content}
        placement={this.placement}
        spotlightKey={this.key}
      >
        {this.children}
      </ThievingSpotlight>,
      this.element
    )
  }

  disconnect () {
    this.element.innerHTML = ''
    this.element.append(this.children)
    delete this.children
  }
}

/**
 * A spotlight which steals its target nodes from elsewhere in the DOM.
 */
function ThievingSpotlight ({ children, content, placement, spotlightKey }) {
  const targetRef = React.useRef()

  React.useEffect(() => {
    if (targetRef.current) {
      targetRef.current.appendChild(...children)
    }
  })

  return (
    <Spotlight
      content={content}
      placement={placement}
      spotlightKey={spotlightKey}
    >
      {({ ref }) => (
        <span
          ref={mergeRefs(ref, targetRef)}
          dangerouslySetInnerHTML={{ __html: '' }}
        />
      )}
    </Spotlight>
  )
}
