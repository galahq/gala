import React from 'react'

export class DashboardCase extends React.Component {

  renderDeleteButton() {
    if (this.props.editing) {
      return <a 
        className="catalog-dashboard__my-cases__case__delete"
        dangerouslySetInnerHTML={{__html: require('dashboard-delete.svg')}} />
    }
  }

  render() {
    let {slug, kicker, squareCoverUrl} = this.props
    return (
      <a className="catalog-dashboard__my-cases__case" href={`/cases/${slug}`}>
        { this.renderDeleteButton() }
        <img src={squareCoverUrl} />
        <strong>{kicker}</strong>
      </a>
    )
  }

}
