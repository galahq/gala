import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router'

import Icon from './Icon.js'

function getElementDataFrom(state) {
  return (uri, i) => {
    const [model, id] = uri.split('/')
    const element = state[`${model}ById`][id]

    var typeIcon = element.iconSlug && <Icon filename={element.iconSlug} />

    return {
      href: `/${i + 1}`,
      typeIcon,
      model,
      ...element,
    }
  }
}

function mapStateToProps(state) {
  return {
    elements: state.caseData.caseElements.map(getElementDataFrom(state)),
  }
}

const TableOfContents = ({elements}) =>
  <nav className="c-toc">
    <h3 className="c-toc__header"><FormattedMessage id="case.toc" /></h3>
    <ol className="c-toc__list">
      { elements.map( (e, i) =>
        <Link className="c-toc__link" activeClassName="c-toc__link--active"
          to={e.href}>
          <li className="c-toc__item" key={e.href}>
            <div className="c-toc__item-data">
              <div className="c-toc__number">{i + 1}</div>
              <div className="c-toc__title">{e.title}</div>
              <div className="c-toc__icon">{e.typeIcon}</div>
            </div>
          </li>
        </Link>
      ) }
    </ol>
  </nav>

export default connect(mapStateToProps)(TableOfContents)
