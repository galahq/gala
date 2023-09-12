/**
 * @providesModule Lock
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { FormattedRelative, FormattedMessage } from 'react-intl'

import { createLock, deleteLock, enqueueLockForDeletion } from 'redux/actions'

import type { Dispatch } from 'redux/actions'
import type { State, Lock as LockT } from 'redux/state'

type OwnProps = {
  param: string,
  type: string,
}

function mapStateToProps (
  { caseData, edit, locks }: State,
  { type, param }: OwnProps
) {
  const { reader } = caseData
  const lock = locks[`${type}/${param}`]
  return {
    lock,
    locked: lock && lock.reader.param !== `${reader?.id || ''}`,
    visible: edit.inProgress,
  }
}

function mapDispatchToProps (dispatch: Dispatch, { type, param }: OwnProps) {
  return {
    onBeginEditing: () => {
      dispatch(createLock(type, param))
    },
    onEditAnyway: () => dispatch(deleteLock(type, param)),
    onFinishEditing: () => {
      dispatch(enqueueLockForDeletion(type, param))
    },
  }
}

type LockableProps = {
  locked: boolean,
  onBeginEditing: () => void,
  onFinishEditing: () => void,
}

type Props = {
  children: LockableProps => React.Node,
  lock: ?LockT,
  onEditAnyway: () => mixed,
  visible: boolean,
} & LockableProps

const Lock = ({
  children,
  lock,
  locked,
  onBeginEditing,
  onEditAnyway,
  onFinishEditing,
  visible,
}: Props) => (
  <>
    {children({ locked, onBeginEditing, onFinishEditing })}
    {visible && locked && lock && (
      <>
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
                  name: lock.reader.name,
                  someTimeAgo: <FormattedRelative value={lock.createdAt} />,
                }}
              />
            </p>
            <button
              className="pt-button pt-intent-danger"
              onClick={onEditAnyway}
            >
              <FormattedMessage id="locks.destroy.editAnyway" />
            </button>
          </div>
        </LockDetails>
      </>
    )}
  </>
)

// $FlowFixMe
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Lock)

/**
 * STYLED COMPONENTS
 */

const LockOverlay = styled.div`
  background-color: hsl(208, 30%, 23%);
  border: 1px solid black;
  border-radius: 2pt;
  height: calc(100% + 16px);
  left: -8px;
  margin: 0;
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
  top: 20%;
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
