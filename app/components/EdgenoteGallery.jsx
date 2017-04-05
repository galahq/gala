import React from 'react'
import Sidebar from 'Sidebar.js'
import OldEdgenote from 'OldEdgenote.js'
import { I18n } from "I18n.js"

class EdgenoteGallery extends React.Component {

  renderEdgenotes() {
    let {edgenotes, caseSlug} = this.props
    return <div className="edgenotes">
      {
        Object.keys(edgenotes).map( (slug) => {
          return (
            <OldEdgenote
              slug={slug}
              contents={edgenotes[slug]}
              caseSlug={caseSlug}
              pathPrefix={""}
              selected={false}
              key={`${slug}`}
              didSave={null}
            />
            )
        } )
      }
    </div>
  }

  render() {
    let {pages} = this.props
    return (
      <div className="window">
        <Sidebar
          pageTitles={pages.map( (p) => { return p.title } )}
          selectedPage={null}
          {...this.props}
        />
        <main id="EdgenoteGallery">
          <div id="EdgenoteGalleryHeader">
            <h1><I18n meaning="edgenote_gallery" /></h1>
          </div>
          {this.renderEdgenotes()}
        </main>
        {this.props.children && React.cloneElement(this.props.children, this.props)}
      </div>
    )
  }
}

export default EdgenoteGallery
