/**
 * @flow
 */

import {
  setUnsaved,
  clearUnsaved,
  fetchForums,
  fetchCommentThreads,
} from 'redux/actions'

import { Orchard } from 'shared/orchard'

import type { GetState, ThunkAction } from 'redux/actions'
import type { CaseDataState } from 'redux/state'

export type UpdateCaseAction = {
  type: 'UPDATE_CASE',
  data: $Shape<CaseDataState>,
  needsSaving: boolean,
}

export function updateCase (
  data: $Shape<CaseDataState>,
  needsSaving?: boolean = true
): UpdateCaseAction {
  if (needsSaving) setUnsaved()
  return { type: 'UPDATE_CASE', data, needsSaving }
}

export function togglePublished (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const { caseData } = getState()
    const { slug, publishedAt, licenseConfig } = caseData
    if (
      window.confirm(`Are you sure you want to change the publish status of this module with the ${licenseConfig.name} license?`)
    ) {
      Orchard.espalier(`cases/${slug}`, {
        case: { published: !publishedAt },
      }).then(() => {
        dispatch(
          updateCase({
            publishedAt: publishedAt ? null : new Date(),
          })
        )
        dispatch(clearUnsaved())
      })
    }
  }
}

export function enrollReader (readerId: string, caseSlug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    await Orchard.graft(`cases/${caseSlug}/enrollment`, {})

    dispatch(setReaderEnrollment(true))
    dispatch(fetchForums(caseSlug))
    dispatch(fetchCommentThreads(caseSlug))
  }
}

export type SetReaderEnrollmentAction = {
  type: 'SET_READER_ENROLLMENT',
  enrollment: boolean,
}

function setReaderEnrollment (enrollment: boolean): SetReaderEnrollmentAction {
  return { type: 'SET_READER_ENROLLMENT', enrollment }
}

export function deleteTeachingGuide (): ThunkAction {
  return async (dispatch: Dispatch, getState: GetState) => {
    const url = getState().caseData.links.teachingGuide
    Orchard.prune(url).then(() =>
      dispatch(updateCase({ teachingGuideUrl: null }, false))
    )
  }
}
