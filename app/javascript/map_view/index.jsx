/**
 * @providesModule MapView
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedMessage, injectIntl } from 'react-intl'

import ReactMapGL, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button, Intent } from '@blueprintjs/core'

import { SectionTitle } from 'catalog/shared'
import { Container as BillboardContainer } from 'overview/Billboard'
import Pin from 'map_view/Pin'

import type { IntlShape } from 'react-intl'
import type { Case, Viewport } from 'redux/state'

type Props = {
  cases: Case[],
  editing?: boolean,
  height?: number,
  intl: IntlShape,
  startingViewport: Viewport,
  title: { id: string },
  onBeginEditing?: () => void,
  onViewportChange?: Viewport => any,
  onFinishEditing?: () => void,
}
type State = {
  hasError: boolean,
  viewport: Viewport,
  acceptingScroll: boolean,
  openPin: string,
}

export const MAPBOX_TOKEN = window.MAPBOX_ACCESS_TOKEN
export const MAPBOX_STYLE = window.MAPBOX_STYLE

class MapViewController extends React.Component<Props, State> {
  // handleChangeViewport is fired when the component first mounts, but we
  // don’t want to create a lock until the user clicks
  ignoreViewportChange = true

  state = {
    hasError: false,
    viewport: this.props.startingViewport,
    acceptingScroll: false,
    openPin: '',
  }

  handleClickMap = () => {
    if (!this.state.acceptingScroll) {
      this.setState({ acceptingScroll: true })
    }
    this.setState({ openPin: '' })
  }

  handleChangeViewport = (viewport: Viewport) => {
    this.setState({ viewport })

    if (this.ignoreViewportChange) {
      this.ignoreViewportChange = false
      return
    }

    this.props.editing &&
      this.props.onBeginEditing &&
      this.props.onBeginEditing()
  }

  handleClickPin = (caseSlug: string) => this.setState({ openPin: caseSlug })

  handleZoomOut = () =>
    this.setState(({ viewport }) => ({
      viewport: { ...viewport, zoom: viewport.zoom - 1 },
    }))
  handleZoomIn = () =>
    this.setState(({ viewport }) => ({
      viewport: { ...viewport, zoom: viewport.zoom + 1 },
    }))

  handleReset = () => {
    this.setState({ viewport: this.props.startingViewport })
    this.props.onFinishEditing && this.props.onFinishEditing()
  }

  handleSave = () => {
    const { onViewportChange, onFinishEditing } = this.props
    onViewportChange && onViewportChange(this.state.viewport)
    onFinishEditing && onFinishEditing()
  }

  componentDidCatch () {
    this.setState({ hasError: true })
  }

  render () {
    if (this.state.hasError) return null

    const { height, cases, title, editing, intl } = this.props
    return (
      <div className="pt-dark">
        {editing && (
          <Instructions>
            <FormattedMessage id="cases.edit.map.instructions" />
          </Instructions>
        )}
        <Container height={height}>
          <MapViewport>
            <MapView
              {...this.state}
              cases={editing ? [] : cases}
              containerHeight="100%"
              containerWidth="100%"
              onClickMap={this.handleClickMap}
              onClickPin={this.handleClickPin}
              onViewportChange={this.handleChangeViewport}
            />
          </MapViewport>
          <PositionedSectionTitle>
            <FormattedMessage {...title} />
          </PositionedSectionTitle>
          {editing && (
            <>
              <PositionedPin />
              <PositionedButtons>
                <PaddedButton
                  disabled={this._viewportSet()}
                  text={intl.formatMessage({ id: 'cases.edit.map.reset' })}
                  onClick={this.handleReset}
                />
                <PaddedButton
                  disabled={this._viewportSet()}
                  icon={this._viewportSet() ? 'tick' : ''}
                  intent={Intent.SUCCESS}
                  text={intl.formatMessage({ id: 'cases.edit.map.set' })}
                  onClick={this.handleSave}
                />
                <PaddedButton
                  aria-label={intl.formatMessage({
                    id: 'cases.edit.map.zoomOut',
                  })}
                  icon="zoom-out"
                  onClick={this.handleZoomOut}
                />
                <PaddedButton
                  aria-label={intl.formatMessage({
                    id: 'cases.edit.map.zoomIn',
                  })}
                  icon="zoom-in"
                  onClick={this.handleZoomIn}
                />
              </PositionedButtons>
            </>
          )}
        </Container>
      </div>
    )
  }

  _viewportSet (): boolean {
    const { startingViewport } = this.props
    const { viewport } = this.state
    return (
      viewport.latitude === startingViewport.latitude &&
      viewport.longitude === startingViewport.longitude &&
      viewport.zoom === startingViewport.zoom
    )
  }
}

export default injectIntl(MapViewController)

const Container = styled.section`
  margin: -1em -2em 0;
  height: ${({ height }) => height || 550}px;
  position: relative;

  ${BillboardContainer} & {
    margin-top: 0;
  }

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

  & .mapboxgl-ctrl-bottom-left {
    left: 25px;
    opacity: 0.4;
  }

  & .mapboxgl-ctrl-bottom-right {
    position: absolute;
    z-index: 1;
    bottom: 0px;
    right: 28px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1px;

    .mapboxgl-ctrl-attrib {
      background-color: transparent;
    }

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
const PositionedButtons = styled.div.attrs({ className: 'pt-dark' })`
  position: absolute;
  top: 40px;
  right: 58px;
  z-index: 1;
`
const PaddedButton = styled(Button)`
  margin-left: 0.5em;
`
const PositionedPin = styled(Pin)`
  position: absolute;
  top: calc(50% - 11px);
  left: calc(50% - 3px);
  z-index: 1;
  pointer-events: none;
`

// eslint-disable-next-line react/prefer-stateless-function
class MapView extends React.Component<{
  acceptingScroll: boolean,
  cases: Case[],
  containerHeight: number | string,
  containerWidth: number | string,
  openPin: string,
  viewport: Viewport,
  onClickMap: () => void,
  onClickPin: string => void,
  onViewportChange: Viewport => void,
}> {
  render () {
    const {
      acceptingScroll,
      cases,
      containerHeight,
      containerWidth,
      openPin,
      viewport,
      onClickMap,
      onClickPin,
      onViewportChange,
    } = this.props
    const { latitude, longitude, zoom } = viewport
    return (
      <ReactMapGL
        mapStyle={MAPBOX_STYLE}
        width={containerWidth}
        height={containerHeight}
        latitude={latitude}
        longitude={longitude}
        zoom={zoom}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        scrollZoom={acceptingScroll}
        mapboxApiAccessToken={token}
        onClick={onClickMap}
        onViewportChange={onViewportChange}
      >
        {cases.map(kase =>
          kase.latitude && kase.longitude ? (
            <Marker
              key={kase.slug}
              latitude={kase.latitude}
              longitude={kase.longitude}
              offsetLeft={-3}
              offsetTop={-11}
            >
              <Pin
                key={kase.slug}
                kase={cases.length > 1 ? kase : undefined}
                isOpen={openPin === kase.slug}
                onClick={onClickPin}
              />
            </Marker>
          ) : null
        )}
      </ReactMapGL>
    )
  }
}

const MapViewport = styled.div`
  width: 100%;
  height: 100%;
`
const Instructions = styled.div.attrs({
  className: 'pt-callout pt-intent-success pt-icon-locate',
})`
  margin-bottom: -2em;
  margin-top: 1em;
  z-index: 1;
`
