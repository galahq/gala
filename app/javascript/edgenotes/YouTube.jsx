/**
 * Video-style Edgenotes currently only support YouTube. A caption should
 * provide a “hook” which compels a reader to watch the video.
 *
 * @providesModule YouTube
 * @flow
 */

import * as React from 'react'

import YoutubePlayer from 'react-youtube-player'

import type { ReduxProps } from './Edgenote'

type Props = { slug: string, ...ReduxProps }
const YouTube = ({ slug, active, activate, deactivate }: Props) =>
  slug && (
    <div>
      <YoutubePlayer
        videoId={slug}
        playbackState={active ? 'playing' : 'paused'}
        configuration={{
          theme: 'light',
        }}
        onPlay={activate}
        onPause={deactivate}
      />
    </div>
  )

export default YouTube
