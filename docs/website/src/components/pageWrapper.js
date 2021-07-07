//wrapper to add some nice margins for JSX pages

import React from 'react'

export default function Wrapper(props) {
  return (
    <div className="container">
      <div className="margin-vert--lg padding-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">{props.children}</div>
        </div>
      </div>
    </div>
  )
}
