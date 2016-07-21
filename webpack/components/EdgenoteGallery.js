import React from 'react'
import Sidebar from './Sidebar.js'
import Edgenote from './Edgenote.js'
import LoadingIcon from './LoadingIcon.js'
import gatherEdgenotes from '../gatherEdgenotes.js'
import { I18n } from "./I18n.js"

class EdgenoteGallery extends React.Component {

  renderEdgenotes() {
    let block
    if (this.props.edgenotes != 0) {
      block = <div className="edgenotes">
                {
                  this.props.edgenotes.map( (slug) => {
                    return (
                      <Edgenote
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
    let {slug, coverURL, title, pages, handleEdit} = this.props
    return (
      <div className="window">
        <Sidebar
          slug={slug}
          coverURL={coverURL}
          title={title}
          pageTitles={pages.map( (p) => { return p.title } )}
          selectedPage={null}
          handleEdit={handleEdit}
        />
        <main id="EdgenoteGallery">
          <div id="EdgenoteGalleryHeader">
            <h1><I18n meaning="edgenote_gallery" /></h1>
          </div>
          {this.renderEdgenotes()}
        </main>
        {this.props.children}
      </div>
    )
  }
}

export default EdgenoteGallery
