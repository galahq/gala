import React from 'react'

export class DashboardCase extends React.Component {

  render() {
    let {slug, kicker, squareCoverUrl} = this.props
    return (
      <a className="catalog-dashboard__my-cases__case" href={`/cases/${slug}`}>
        <img src={squareCoverUrl} />
        <strong>{kicker}</strong>
      </a>
    )
  }

}
