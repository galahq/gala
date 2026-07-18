/**
 *
 */

import {
  setUnsaved,
  clearUnsaved,
  fetchForums,
  fetchCommentThreads,
} from 'redux/actions'

import { Orchard, ignoreClientError } from 'shared/orchard'



export function updateCase (
  data,
  needsSaving = true
) {
  if (needsSaving) setUnsaved()
  return { type: 'UPDATE_CASE', data, needsSaving }
}

export function togglePublished () {
  return (dispatch, getState) => {
    const { caseData } = getState()
    const { slug, publishedAt, licenseConfig } = caseData
    const licenseName = licenseConfig?.name || 'unknown'
    if (
      window.confirm(`Are you sure you want to change the publish status of this module with the ${licenseName} license?`)
    ) {
      Orchard.espalier(`cases/${slug}`, {
        case: { published: !publishedAt },
      })
        .then(() => {
          dispatch(
            updateCase({
              publishedAt: publishedAt ? null : new Date(),
            })
          )
          dispatch(clearUnsaved())
        })
        .catch(ignoreClientError) // 403 for a non-owner editor
    }
  }
}

export function enrollReader (readerId, caseSlug) {
  return async (dispatch) => {
    try {
      await Orchard.graft(`cases/${caseSlug}/enrollment`, {})
      dispatch(setReaderEnrollment(true))
      dispatch(fetchForums(caseSlug))
      dispatch(fetchCommentThreads(caseSlug))
    } catch (e) {
      ignoreClientError(e) // 403 if the reader isn't a student for this case
    }
  }
}


function setReaderEnrollment (enrollment) {
  return { type: 'SET_READER_ENROLLMENT', enrollment }
}

export function deleteTeachingGuide () {
  return async (dispatch, getState) => {
    const url = getState().caseData.links.teachingGuide
    Orchard.prune(url)
      .then(() => dispatch(updateCase({ teachingGuideUrl: null }, false)))
      .catch(ignoreClientError) // 404 if already detached, 403 if not permitted
  }
}
