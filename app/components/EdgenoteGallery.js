import React from 'react'
import Sidebar from 'Sidebar.js'
import OldEdgenote from 'OldEdgenote.js'
import LoadingIcon from 'LoadingIcon.js'
import { I18n } from "I18n.js"

class EdgenoteGallery extends React.Component {

  renderEdgenotes() {
    let block
    if (this.props.edgenotes != 0) {
      block = <div className="edgenotes">
                {
                  this.props.edgenotes.map( (slug) => {
                    return (
                      <OldEdgenote
                        random={true}
                        pathPrefix={""}
                        selectedEdgenote={null}
                        slug={slug}
                        key={`edgenote_${slug}`}
                      />
                    )
                  } )
                }
              </div>
    } else {
      block =  <LoadingIcon />
    }
    return block
  }

  render() {
    let {pages, didSave} = this.props
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
        {this.props.children && React.cloneElement(this.props.children, {didSave: didSave})}
      </div>
    )
  }
}

export default EdgenoteGallery
