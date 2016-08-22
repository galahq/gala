import React from 'react';
var strings = require('locales.json')

export class I18n extends React.Component {
  t(key) {
    let locale = window.i18n.locale
    let minimalLocale = locale.split('-')[0]
    return (
      (strings[minimalLocale] && strings[minimalLocale][key]) ||
      (strings[locale] && strings[locale][key]) ||
      strings.en[key] ||
      key
    )
  }

  render() {
    return (
      <span lang={window.i18n.locale.split('-')[0]}>
        {this.t(this.props.meaning)}
      </span>
    )
  }
}
