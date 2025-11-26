/**
 * A HOC to fetch a link expansion preview or embed.
 *
 * @providesModule withExpansion
 * @flow
 */

import * as React from 'react'
import LinkExpansion, { NullLinkExpansion } from './LinkExpansion'

import type { Edgenote } from 'redux/state'
import type { ILinkExpansion } from './LinkExpansion'

type BaseProps = { contents: ?Edgenote }
type State = { expansion: ILinkExpansion, url: string }
export default function withExpansion<Props: BaseProps> (
  Component: React.ComponentType<{ ...Props, expansion: ILinkExpansion }>
): React.ComponentType<Props> {
  class WrapperComponent extends React.Component<Props, State> {
    state = {
      expansion: new NullLinkExpansion(this.props.contents?.websiteUrl),
      url: this.props.contents?.websiteUrl || '',
    }

    componentDidMount () {
      this._fetchExpansion()
    }

    componentDidUpdate (prevProps: BaseProps, prevState: State) {
      const contentsChanged =
        !prevProps.contents !== !this.props.contents ||
        (prevProps.contents &&
          this.props.contents &&
          (prevProps.contents.updatedAt !== this.props.contents.updatedAt ||
            prevState.url !== this.state.url))

      if (contentsChanged) {
        this._fetchExpansion()
      }

      if (
        prevProps.contents?.websiteUrl !== this.props.contents?.websiteUrl
      ) {
        const url = this.props.contents?.websiteUrl || ''
        this.setState({ url })
      }
    }

    render () {
      return <Component {...this.props} expansion={this.state.expansion} />
    }

    _fetchExpansion () {
      if (!this.props.contents) {
        this.setState({
          expansion: new NullLinkExpansion(''),
          url: '',
        })
        return
      }
      const { slug, updatedAt } = this.props.contents
      const { url } = this.state
      LinkExpansion.fetch({ slug, updatedAt, url }).then(expansion =>
        this.setState({ expansion })
      )
    }
  }

  WrapperComponent.displayName = `withExpansion(${Component.displayName ||
    Component.name})`
  return WrapperComponent
}