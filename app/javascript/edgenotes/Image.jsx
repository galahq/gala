/**
 * Image-style Edgenotes present an image which can be zoomed in. The caption
 * should provide the “so what?” that contextualizes an image. It is possible
 * that the caption can be descriptive enough not to require alt text.
 *
 * @providesModule Image
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import ImageZoom from 'react-medium-image-zoom'

import type { ReduxProps } from './Edgenote'

type Props = {
  src: string,
  alt: string,
  photoCredit: string,
  callToAction: string,
  ...ReduxProps,
}

const Image = ({
  src,
  alt,
  photoCredit,
  callToAction,
  active,
  activate,
  deactivate,
}: Props) => {
  let imageProps = {
    style: { width: '100%', minHeight: '3em', display: 'block' },
    src: `${src}?w=640`,
    alt,
  }
  let imageComponent = callToAction ? (
    <img alt={alt} {...imageProps} />
  ) : (
    <ImageZoom
      isZoomed={active}
      defaultStyles={{ overlay: { backgroundColor: '#1D2934' }}}
      image={imageProps}
      zoomImage={{ src }}
      onZoom={activate}
      onUnzoom={deactivate}
    />
  )

  return (
    <div>
      {src && photoCredit && <PhotoCredit>{photoCredit}</PhotoCredit>}
      {src && imageComponent}
    </div>
  )
}

export default Image

const PhotoCredit = styled.cite`
  text-transform: uppercase;
  letter-spacing: 0.25px;
  color: rgba(235, 234, 228, 0.5);
  font: normal 500 10px ${p => p.theme.sansFont};
  display: block;
  min-width: 100%;
  text-align: right;
  margin: 2px -3px;
`
