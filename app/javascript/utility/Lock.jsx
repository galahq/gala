/**
 * @providesModule Lock
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { FormattedRelative, FormattedMessage } from 'react-intl'

const reader = {
  type: 'Reader',
  table: 'readers',
  param: '2',
  imageUrl:
    '/rails/active_storage/variants/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBZUk9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--4a867c77a651735ac13737582dcbe8e7f4a4e439/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCam9PZEdoMWJXSnVZV2xzU1NJTk1UQXdlREV3TUY0R09nWkZWQT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--76ab9de1d2e504c8e6bde0b7b9990f1713e4f7a8/griffin.jpeg',
  hashKey: 'f8b92ac580f078295d054b6df47f41eabd62ed763a00950152d8bc1da80d8743',
  name: 'Cameron Bothner',
}
const time = new Date('2018-05-23T16:26:07.639Z')

type Props = {
  children: () => React.Node,
  locked?: boolean,
  visible?: boolean,
}

const Lock = ({ children, locked, visible }: Props) => (
  <React.Fragment>
    {children()}
    {locked &&
      visible && (
      <React.Fragment>
        <LockOverlay />
        <LockDetails>
          <div className="pt-callout pt-intent-danger pt-icon-lock">
            <h5 className="pt-callout-title">
              <FormattedMessage id="locks.lock.thisSectionIsLocked" />
            </h5>
            <p>
              <FormattedMessage
                id="locks.lock.details"
                values={{
                  name: reader.name,
                  someTimeAgo: <FormattedRelative value={time} />,
                }}
              />
            </p>
            <button className="pt-button pt-intent-danger">
              <FormattedMessage id="locks.destroy.editAnyway" />
            </button>
          </div>
        </LockDetails>
      </React.Fragment>
    )}
  </React.Fragment>
)

export default Lock

/**
 * STYLED COMPONENTS
 */

const LockOverlay = styled.div`
  background-color: hsl(208, 30%, 23%);
  border: 1px solid black;
  border-radius: 2pt;
  height: calc(100% + 16px);
  left: -8px;
  mix-blend-mode: hard-light;
  position: absolute;
  top: -8px;
  width: calc(100% + 16px);
  z-index: 10;
`

const LockDetails = styled.div.attrs({ className: 'pt-card pt-elevation-4' })`
  background-color: #fdfdfa !important;
  color: #01182e !important;
  left: 50%;
  opacity: 0;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: 0.2s ease-out opacity 0.1s;
  width: 300px;
  z-index: 11;

  ${LockOverlay}:hover + &,
  &:hover {
    opacity: 1;
  }

  .pt-callout.pt-intent-danger[class*='pt-icon-']::before,
  .pt-callout.pt-intent-danger h5 {
    color: #c23030 !important;
  }

  h5 {
    font-family: ${p => p.theme.sansFont};
    line-height: 20px;
    margin: 0 0 5px 0;
  }

  p {
    font-family: ${p => p.theme.sansFont};
    font-weight: 400;
    line-height: 1.4;
    margin: 0 0 0.65em;
  }

  button {
    box-shadow: inset 0 0 0 1px rgba(16, 22, 26, 0.4),
      inset 0 -1px 0 rgba(16, 22, 26, 0.2) !important;
  }
`
