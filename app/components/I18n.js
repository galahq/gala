import React from 'react';
var strings = require('../locales.json')

export class I18n extends React.Component {
  t(key) {
    return (strings[window.i18n.locale] && strings[window.i18n.locale][key]) || strings.en[key] || key
  }

  render() {
    return (
      <span lang={window.i18n.locale}>
        {this.t(this.props.meaning)}
      </span>
    )
  }
}
