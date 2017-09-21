/**
 * @providesModule MapView
 * @flow
 */

import React, { Component } from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { values } from 'ramda'

import Dimensions from 'react-dimensions'
import ReactMapGL, { Marker } from 'react-map-gl'

import { SectionTitle } from 'catalog/shared'
import Pin from 'catalog/Pin'

import type { Case } from 'redux/state'

type OwnProps = {
  cases: { [string]: Case },
}
type Props = OwnProps & {
  containerWidth: number,
  containerHeight: number,
}
class MapView extends Component {
  props: Props
  state = {
    viewport: {
      latitude: 18.666477929311778,
      longitude: 27.609235818471717,
      zoom: 1.1606345336768273,
    },
    acceptingScroll: false,
    openPin: '',
  }

  handleClickMap = () => {
    if (!this.state.acceptingScroll) {
      this.setState({ acceptingScroll: true })
    }
    this.setState({ openPin: '' })
  }

  handleViewportChange = viewport => this.setState({ viewport })

  handleClickPin = (caseSlug: string) => this.setState({ openPin: caseSlug })

  render () {
    const { cases } = this.props
    const { viewport, acceptingScroll, openPin } = this.state
    const { latitude, longitude, zoom } = viewport
    return (
      <ReactMapGL
        mapStyle="mapbox://styles/cbothner/cj5l9s2dg2aps2sqfrnidiq14"
        width={this.props.containerWidth}
        height={this.props.containerHeight}
        latitude={latitude}
        longitude={longitude}
        zoom={zoom}
        scrollZoom={acceptingScroll}
        onClick={this.handleClickMap}
        onViewportChange={this.handleViewportChange}
      >
        {values(cases).map(
          kase =>
            kase.latitude && kase.longitude ? (
              <Marker
                latitude={kase.latitude}
                longitude={kase.longitude}
                offsetLeft={-3}
                offsetTop={-11}
              >
                <Pin
                  key={kase.slug}
                  kase={kase}
                  isOpen={openPin === kase.slug}
                  onClick={this.handleClickPin}
                />
              </Marker>
            ) : null
        )}
      </ReactMapGL>
    )
  }
}

const AutosizedMapView = Dimensions()(MapView)

const WrappedMapView = (props: OwnProps) => (
  <Container>
    <AutosizedMapView {...props} />
    <PositionedSectionTitle>
      <FormattedMessage
        id="catalog.locations"
        defaultMessage="Site Locations"
      />
    </PositionedSectionTitle>
  </Container>
)
export default WrappedMapView

const Container = styled.section`
  margin: 0 -3em;
  height: 550px;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-shadow: inset 0 0 70px 45px #35526f;
    pointer-events: none;
  }

  & .mapboxgl-ctrl-bottom-right {
    position: absolute;
    z-index: 1;
    bottom: 0px;
    right: 53px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1px;

    & a {
      color: #5c748a;
      &:hover {
        color: #ebeae4;
      }
      &:not(:last-child) {
        margin-right: 1em;
      }
    }
  }
`
const PositionedSectionTitle = styled(SectionTitle)`
  position: absolute;
  top: 40px;
  left: 58px;
  z-index: 1;
`
