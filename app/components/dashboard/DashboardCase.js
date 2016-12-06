import React, {PropTypes} from 'react'

export class DashboardCase extends React.Component {

  renderDeleteButton() {
    if (this.props.editing) {
      return <a 
        className="catalog-dashboard__my-cases__case__delete"
        dangerouslySetInnerHTML={{__html: require('dashboard-delete.svg')}}
        onClick={() => {this.props.deleteEnrollment(this.props.enrollmentId)}}
      />
    }
  }

  render() {
    let {slug, kicker, squareCoverUrl, editing} = this.props
    return (
      <div style={{position: 'relative'}}>
        <a className="catalog-dashboard__my-cases__case" href={editing ? '#' : `/cases/${slug}`}>
          <img src={squareCoverUrl} />
          <strong>{kicker}</strong>
        </a>
        { this.renderDeleteButton() }
      </div>
    )
  }

}

DashboardCase.propTypes = {
  editing: PropTypes.bool,
  slug: PropTypes.string,
  squareCoverUrl: PropTypes.string,
  kicker: PropTypes.string,
  enrollmentId: PropTypes.number,
  deleteEnrollment: PropTypes.func
}
