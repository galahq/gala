/**
 * Video-style Edgenotes currently only support YouTube. A caption should
 * provide a “hook” which compels a reader to watch the video.
 *
 * @providesModule YouTube
 * @flow
 */

import * as React from 'react'

import YoutubePlayer from 'react-youtube-player'

import EditableAttribute from 'utility/EditableAttribute'

import type { ReduxProps } from './Edgenote'

type Props = {
  slug: string,
  onChange: string => any,
  ...ReduxProps,
}
const YouTube = ({
  slug,
  active,
  activate,
  deactivate,
  editing,
  onChange,
}: Props) => (
  <div>
    {slug && (
      <YoutubePlayer
        videoId={slug}
        playbackState={active ? 'playing' : 'paused'}
        configuration={{
          theme: 'light',
        }}
        onPlay={activate}
        onPause={deactivate}
      />
    )}
    <EditableAttribute
      disabled={!editing}
      title="YouTube slug"
      value={slug}
      onChange={onChange}
    />
  </div>
)

export default YouTube
