import React from 'react'
import '../stylesheets/EdgenoteGallery.scss'
import Sidebar from './Sidebar.js'
import Edgenote from './Edgenote.js'
import LoadingIcon from './LoadingIcon.js'
import gatherEdgenotes from '../gatherEdgenotes.js'

class EdgenoteGallery extends React.Component {
  constructor() {
    super()
    this.state = {
      edgenote_ids: []
    }
  }

  setEdgenotes(contents) {
    let edgenote_ids = gatherEdgenotes(contents)
    this.setState({edgenote_ids: edgenote_ids})
  }

  componentDidMount() {
    let contents = this.props.chapters.length > 0 ? this.props.chapters.map((x) => {return x.innerHTML}) : ""
    this.setEdgenotes(contents)
  }
  componentWillReceiveProps(nextProps) {
    let contents = nextProps.chapters.length > 0 ? nextProps.chapters.map((x) => {return x.innerHTML}) : ""
    this.setEdgenotes(contents)
  }

  renderEdgenotes() {
    let block
    if (this.state.edgenote_ids.length != 0) {
      block = <aside className="edgenotes">
                {
                  this.state.edgenote_ids.map( (id) => {
                    return (
                      <Edgenote
                        path_prefix={`/read/${this.props.params.id}`}
                        selected_id={this.state.selected_id}
                        id={id}
                        key={`edgenote_${id}`}
                        handleHoverID={this.props.id}
                      />
                    )
                  } )
                }
              </aside>
    } else {
      block =  <LoadingIcon />
    }
    return block
  }

  render() {
    return (
      <div className="window">
        <Sidebar
          caseID={this.props.params.id}
          title={this.props.title}
        />
        <main id="EdgenoteGallery">
          <div id="EdgenoteGalleryHeader">
            <h1>Edgenote Gallery</h1>
          </div>
          {this.renderEdgenotes()}
        </main>
        {this.props.children}
      </div>
    )
  }
}

export default EdgenoteGallery
