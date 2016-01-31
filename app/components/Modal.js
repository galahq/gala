import React from 'react'
import {Link} from 'react-router'
import '../stylesheets/Modal.scss'


class Modal extends React.Component {

  constructor() {
    super()
    this.state = {
      contents: {__html: ""}
    }
  }

  parseContentsFromJSON(r) {
    this.setState({
      contents: {__html: r.content.rendered}
    })
  }

  downloadEdgenote() {
    $.ajax({
      type: 'GET',
      url: 'http://remley.wcbn.org/ihih-msc/index.php',
      data: [
        {name: 'rest_route', value: `/wp/v2/posts/${this.props.params.edgenoteID}`}
      ],
      dataType: 'json',
      success: (response) => {
        this.parseContentsFromJSON(response)
      }
    })
  }

  componentDidMount() {
    this.downloadEdgenote()
  }

  render() {
    return (
      <dialog>
        <Link to={`/read/${this.props.params.id}/${this.props.params.chapter}`} className="modalDismiss">
          &nbsp;
        </Link>
        <aside className="Card" dangerouslySetInnerHTML={this.state.contents} />
      </dialog>
    )
  }

}

export default Modal
