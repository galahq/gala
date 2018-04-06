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
import { FormattedMessage } from 'react-intl'
import { LabelForScreenReaders } from 'utility/A11y'

import type { ReduxProps } from './Edgenote'

type Props = {
  src: string,
  thumbnailSrc: ?string,
  alt: string,
  photoCredit: string,
  callToAction: string,
  ...ReduxProps,
}

const Image = ({
  src,
  thumbnailSrc,
  alt,
  photoCredit,
  callToAction,
  active,
  activate,
  deactivate,
}: Props) => {
  let thumbnailProps = {
    style: { width: '100%', minHeight: '3em', display: 'block' },
    src: thumbnailSrc || src,
    alt,
  }
  let imageComponent = callToAction ? (
    <img alt={alt} {...thumbnailProps} />
  ) : (
    <ImageZoom
      isZoomed={active}
      defaultStyles={{ overlay: { backgroundColor: '#1D2934' }}}
      image={thumbnailProps}
      zoomImage={{ src }}
      onZoom={activate}
      onUnzoom={deactivate}
    />
  )

  return (
    <Container>
      {src && imageComponent}
      {src &&
        photoCredit && (
          <PhotoCredit>
            <LabelForScreenReaders>
              <FormattedMessage id="activerecord.attributes.edgenote.photoCredit" />:
            </LabelForScreenReaders>
            {photoCredit}
          </PhotoCredit>
        )}
    </Container>
  )
}

export default Image

const Container = styled.div`
  display: flex;
  flex-direction: column-reverse;

  img {
    background-color: #4e6881aa;
  }
`

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
