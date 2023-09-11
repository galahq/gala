/**
 * @flow
 */

import * as React from 'react'

import { displayToast, dismissToast } from 'redux/actions'

import { Orchard } from 'shared/orchard'
import * as R from 'ramda'
import { Intent, ProgressBar } from '@blueprintjs/core'

import type { ThunkAction, GetState, Dispatch } from 'redux/actions'
import type { Edgenote, LinkExpansionVisibility } from 'redux/state'
import type { FormContents as EdgenoteFormContents } from 'edgenotes/editor/EdgenoteForm'
import type Attachment from 'edgenotes/editor/attachment'

export function createEdgenote (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const { slug } = getState().caseData
    return Orchard.graft(`cases/${slug}/edgenotes`, {}).then(
      (edgenote: Edgenote) => {
        dispatch(addEdgenote(edgenote.slug, edgenote))
        return edgenote.slug
      }
    )
  }
}

export type AddEdgenoteAction = {
  type: 'ADD_EDGENOTE',
  slug: string,
  data: Edgenote,
}
export function addEdgenote (slug: string, data: Edgenote): AddEdgenoteAction {
  return { type: 'ADD_EDGENOTE', slug, data }
}

const filterParams: $FlowIssue = R.pick([
  'altText',
  'attribution',
  'audio',
  'callToAction',
  'caption',
  'content',
  'file',
  'format',
  'layout',
  'iconSlug',
  'image',
  'photoCredit',
  'pullQuote',
  'websiteUrl',
])

export function changeEdgenote (
  slug: string,
  contents: EdgenoteFormContents
): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const {
      self: edgenotePath,
      image: imagePath,
      audio: audioPath,
      file: filePath,
    } = getState().edgenotesBySlug[slug].links

    return Promise.all([
      uploadOrDetach(dispatch, contents.imageUrl, 'image', imagePath),
      uploadOrDetach(dispatch, contents.audioUrl, 'audio', audioPath),
      uploadOrDetach(dispatch, contents.fileUrl, 'file', filePath),
    ]).then(patches =>
      Orchard.espalier(edgenotePath, {
        edgenote: filterParams(
          R.reduce((obj, patch) => ({ ...obj, ...patch }), contents, patches)
        ),
      }).then((edgenote: Edgenote) => dispatch(updateEdgenote(slug, edgenote)))
    )
  }
}

function uploadOrDetach (
  dispatch: Dispatch,
  attachment: ?Attachment,
  attribute: string,
  detachEndpoint: string
): Promise<Object> {
  if (attachment == null) return Promise.resolve({})
  const key = `image-${new Date().getTime()}`
  const onDismiss = () => dispatch(dismissToast(key))

  return attachment
    .save({
      detachEndpoint,
      onProgress: progress =>
        dispatch(
          displayToast({ ...progressBarToastProps(progress), onDismiss }, key)
        ),
    })
    .then(blobId =>
      blobId
        ? {
            [attribute]: blobId,
          }
        : {}
    )
}

function progressBarToastProps (progress: number) {
  return {
    icon: 'cloud-upload',
    timeout: progress < 100 ? 0 : 2000,
    message: (
      <ProgressBar
        className={progress >= 100 ? 'pt-no-stripes' : ''}
        intent={progress < 100 ? Intent.PRIMARY : Intent.SUCCESS}
        value={progress / 100}
      />
    ),
  }
}

export type UpdateEdgenoteAction = {
  type: 'UPDATE_EDGENOTE',
  slug: string,
  data: Edgenote,
  needsSaving: boolean,
}
export function updateEdgenote (
  slug: string,
  data: Edgenote,
  needsSaving?: boolean = true
): UpdateEdgenoteAction {
  return { type: 'UPDATE_EDGENOTE', slug, data, needsSaving }
}

export function deleteEdgenote (slug: string): ThunkAction {
  return (dispatch: Dispatch) => {
    if (
      window.confirm(
        'Are you sure you want to delete this Edgenote? This action cannot be undone.'
      )
    ) {
      return Orchard.prune(`edgenotes/${slug}`).then(() =>
        dispatch(removeEdgenote(slug))
      )
    }
  }
}

export type RemoveEdgenoteAction = {
  type: 'REMOVE_EDGENOTE',
  slug: string,
}
export function removeEdgenote (slug: string): RemoveEdgenoteAction {
  return { type: 'REMOVE_EDGENOTE', slug }
}

export function updateLinkExpansionVisibility (
  edgenoteSlug: string,
  { noDescription, noEmbed, noImage }: LinkExpansionVisibility
): ThunkAction {
  return () =>
    [noDescription, noEmbed, noImage].some(attribute => attribute != null) &&
    Orchard.espalier(`edgenotes/${edgenoteSlug}/link_expansion`, {
      visibility: { noDescription, noEmbed, noImage },
    })
}

export type HighlightEdgenoteAction = {
  type: 'HIGHLIGHT_EDGENOTE',
  slug: string | null,
}
export function highlightEdgenote (
  slug: string | null
): HighlightEdgenoteAction {
  return { type: 'HIGHLIGHT_EDGENOTE', slug }
}

export type ActivateEdgenoteAction = {
  type: 'ACTIVATE_EDGENOTE',
  slug: string | null,
}
export function activateEdgenote (slug: string | null): ActivateEdgenoteAction {
  return { type: 'ACTIVATE_EDGENOTE', slug }
}
