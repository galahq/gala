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
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'

import { EditableText } from '@blueprintjs/core'

import EditableAttribute from 'utility/EditableAttribute'

import type { ReduxProps } from './Edgenote'

type Props = {
  attribution: string,
  audioUrl: string,
  contents: string,
  hasBackground: boolean,
  onChangeProp: string => string => any,
  ...ReduxProps,
}
const PullQuote = ({
  attribution,
  audioUrl,
  contents,
  hasBackground,
  selected,
  editing,
  active,
  onChangeProp,
}: Props) => (
  <React.Fragment>
    <Background visible={hasBackground}>
      {contents || editing ? (
        <blockquote
          className={selected ? 'edge--highlighted' : ''}
          style={{
            fontSize: '140%',
            lineHeight: 1.3,
            margin: '0 0 0.5em 0',
            padding: '0',
          }}
        >
          <EditableText
            multiline
            placeholder="“Add quotation...”"
            value={contents}
            disabled={!editing}
            onChange={onChangeProp('pullQuote')}
          />
        </blockquote>
      ) : null}
      <Attribution
        name={attribution}
        editing={editing}
        onChange={onChangeProp('attribution')}
      />
    </Background>
    <AudioPlayer
      src={audioUrl}
      editing={editing}
      active={active}
      onChange={onChangeProp('audioUrl')}
    />
  </React.Fragment>
)

export default PullQuote

const Background = styled.div`
  ${p =>
    p.visible &&
    css`
      background-color: #49647d;
      padding: 0.5em 1em;
      border-radius: 2px 2px 0 0;
    `};
`

const Attribution = ({ name, editing, onChange }) =>
  name || editing ? (
    <cite
      style={{
        textAlign: 'right',
        display: 'block',
        fontStyle: 'normal',
        margin: '0.5em 0 0.25em 0',
        lineHeight: 1,
      }}
    >
      <EditableText
        multiline
        placeholder="— Attribution"
        value={name}
        disabled={!editing}
        onChange={onChange}
      />
    </cite>
  ) : null

type AudioPlayerProps = {
  src: string,
  active: boolean,
  editing: boolean,
  onChange: string => any,
}

class AudioPlayer extends React.Component<AudioPlayerProps> {
  audioPlayer: ?HTMLAudioElement

  componentDidUpdate (prevProps: AudioPlayerProps) {
    if (!prevProps.active && this.props.active) {
      this.audioPlayer && this.audioPlayer.play()
    }
  }

  render () {
    let { src, editing, onChange } = this.props
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
        <EditableAttribute
          disabled={!editing}
          title="audio url"
          value={src}
          onChange={onChange}
        />
      </div>
    )
  }
}
