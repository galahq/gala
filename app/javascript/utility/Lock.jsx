/**
 * @providesModule Lock
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { FormattedRelative, FormattedMessage } from 'react-intl'

import { createLock, deleteLock, enqueueLockForDeletion } from 'redux/actions'

import Overlay from 'shared/Overlay'

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
      <Overlay>
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
          <button className="pt-button pt-intent-danger" onClick={onEditAnyway}>
            <FormattedMessage id="locks.destroy.editAnyway" />
          </button>
        </div>
      </Overlay>
    )}
  </>
)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Lock)
