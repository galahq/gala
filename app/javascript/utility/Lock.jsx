/**
 * @providesModule Lock
 * 
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { FormattedRelative } from 'shared/FormattedRelative'

import { createLock, deleteLock, enqueueLockForDeletion } from 'redux/actions'



function mapStateToProps (
  { caseData, edit, locks },
  { type, param }
) {
  const { reader } = caseData
  const lock = locks[`${type}/${param}`]
  return {
    lock,
    locked: lock && lock.reader.param !== `${reader?.id || ''}`,
    visible: edit.inProgress,
  }
}

function mapDispatchToProps (dispatch, { type, param }) {
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



const Lock = ({
  children,
  lock,
  locked,
  onBeginEditing,
  onEditAnyway,
  onFinishEditing,
  visible,
}) => (
  <>
    {children({ locked, onBeginEditing, onFinishEditing })}
    {visible && locked && lock && (
      <>
        <LockOverlay />
        <LockDetails>
          <div className="bp6-callout bp6-intent-danger bp6-icon-lock">
            <h5 className="bp6-heading">
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
              className="bp6-button bp6-intent-danger"
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

const LockDetails = styled.div.attrs({ className: 'bp6-card bp6-elevation-4' })`
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

  .bp6-callout.bp6-intent-danger[class*='bp6-icon-']::before,
  .bp6-callout.bp6-intent-danger h5 {
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
