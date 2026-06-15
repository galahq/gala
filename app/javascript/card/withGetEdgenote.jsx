/**
 * This Higher Order Component provides a function to get an Edgenote record for
 * attachment to a Card. If all the case’s Edgenotes are attached to cards, this
 * simply creates a new one; however if there are some Edgenotes that are not
 * attached, it presents a library dialog letting the user select a previously
 * created Edgenote or create a new one. I think this is sorta like redux-saga…
 *
 * @providesModule withGetEdgenote
 *
 */

import * as React from 'react'

import EdgenoteLibrary from 'edgenotes/EdgenoteLibrary'


export const GET_EDGENOTE_NO_PROMISE_ERROR =
  'getEdgenote tried to resolve an invalid promise. What’s up?'

function withGetEdgenote (
  Component
) {
  class WrapperComponent extends React.Component {
    state = { open: false }

    promise = new Promise(() => new Error(GET_EDGENOTE_NO_PROMISE_ERROR))
    resolve = _ => {}
    reject = _ => {}

    render () {
      return (
        <>
          <Component {...this.props} getEdgenote={this.getEdgenote} />

          {this.state.open && (
            <EdgenoteLibrary
              onSelectEdgenote={this.handleSelectEdgenote}
              onCancel={this.handleCancel}
            />
          )}
        </>
      )
    }

    getEdgenote = () => {
      if (!this.state.open) {
        this.promise = new Promise((resolve, reject) => {
          this.resolve = resolve
          this.reject = reject
          this.setState({ open: true })
        })
      }

      return this.promise
    }

    handleSelectEdgenote = (slug) => {
      this.resolve(slug)
      this._reset()
    }

    handleCancel = () => {
      this.reject()
      this._reset()
    }

    _reset () {
      this.setState({ open: false })
      this.promise = new Promise(() => new Error(GET_EDGENOTE_NO_PROMISE_ERROR))
      this.resolve = _ => {}
      this.reject = _ => {}
    }
  }

  WrapperComponent.displayName = `withGetEdgenote(${Component.displayName ||
    Component.name})`
  return WrapperComponent
}
export default withGetEdgenote
