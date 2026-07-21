/**
 * A quotation-style Edgenote can have a pull quote, attribution for that
 * quotation, and an audio snippet.
 *
 * If audio is provided, the pull quote is expected to provide a “hook” to
 * compel a reader to listen. Otherwise, the quotation serves the same purpose
 * for the website to which the Edgenote links.
 *
 * These pull quotes should be quite short: likely too short to stand alone
 * without a website link or an audio snippet.
 *
 * @providesModule PullQuote
 * 
 */

import * as React from 'react'
import styled, { css } from 'styled-components'

import { FormattedMessage } from 'react-intl'


const PullQuote = ({
  attribution,
  audioUrl,
  contents,
  hasBackground,
  selected,
  active,
}) => (
  <>
    <Background visible={hasBackground}>
      {contents && (
        <blockquote
          className={selected ? 'edge--highlighted' : ''}
          style={{
            fontSize: '140%',
            lineHeight: 1.3,
            margin: '0 0 0.5em 0',
            padding: '0',
            display: 'inline',
          }}
        >
          {contents.trim().startsWith('“') || (
            <FormattedMessage id="support.quote.begin" />
          )}
          {contents}
          {contents.trim().endsWith('”') || (
            <FormattedMessage id="support.quote.end" />
          )}
        </blockquote>
      )}
      <Attribution name={attribution} />
    </Background>
    <AudioPlayer src={audioUrl} active={active} />
  </>
)

export default PullQuote

const Background = styled.div`
  max-width: 40em;
  ${p =>
    p.visible &&
    css`
      background-color: #49647d;
      padding: 0.5em 1em;
      border-radius: 2px 2px 0 0;
    `};
`

const Attribution = ({ name }) =>
  name ? (
    <cite
      style={{
        textAlign: 'right',
        display: 'block',
        fontStyle: 'normal',
        margin: '0.5em 0 0.25em 0',
        lineHeight: 1,
      }}
    >
      {name && !name.trim().startsWith('—') && (
        <FormattedMessage id="support.quote.attributionPrefix" />
      )}
      {name}
    </cite>
  ) : null


class AudioPlayer extends React.Component {
  audioPlayer

  componentDidUpdate (prevProps) {
    if (!prevProps.active && this.props.active) {
      this.audioPlayer && this.audioPlayer.play()
    }
  }

  render () {
    let { src } = this.props
    return (
      <div>
        {src && (
          // TODO
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio
            controls
            ref={c => {
              this.audioPlayer = c
            }}
            style={{
              width: '100%',
              borderRadius: 2,
              borderBottom: `4px solid #6ACB72`,
            }}
            src={src}
          />
        )}
      </div>
    )
  }
}
