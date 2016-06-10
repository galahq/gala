import React from 'react'
import Sidebar from './Sidebar.js'
import Edgenote from './Edgenote.js'
import LoadingIcon from './LoadingIcon.js'
import gatherEdgenotes from '../gatherEdgenotes.js'
import { I18n } from "./I18n.js"

class EdgenoteGallery extends React.Component {
  constructor() {
    super()
    this.state = {
      edgenoteSlugs: []
    }
  }

  setEdgenotes(contents) {
    let edgenoteSlugs = gatherEdgenotes(contents)
    this.setState({edgenoteSlugs: edgenoteSlugs})
  }

  componentDidMount() {
    let contents = window.caseData.segments.length > 0 ? window.caseData.segments.map((x) => {return x[1]}) : ""
    this.setEdgenotes(contents)
  }

  renderEdgenotes() {
    let block
    if (this.state.edgenoteSlugs.length != 0) {
      block = <div className="edgenotes">
                {
                  this.state.edgenoteSlugs.map( (slug) => {
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
    let {slug, coverURL, title, segmentTitles} = this.props
    let selectedSegment = parseInt(this.props.params.selectedSegment) - 1
    return (
      <div className="window">
        <Sidebar
          slug={slug}
          coverURL={coverURL}
          title={title}
          segmentTitles={segmentTitles}
          selectedSegment={selectedSegment}
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
