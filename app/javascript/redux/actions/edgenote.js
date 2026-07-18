/**
 *
 */

import * as React from 'react'

import { displayToast, dismissToast } from 'redux/actions'

import { Orchard, ignoreClientError } from 'shared/orchard'
import * as R from 'ramda'
import { Intent, ProgressBar } from '@blueprintjs/core'


export function createEdgenote () {
  return (dispatch, getState) => {
    const { slug } = getState().caseData
    return Orchard.graft(`cases/${slug}/edgenotes`, {})
      .then((edgenote) => {
        dispatch(addEdgenote(edgenote.slug, edgenote))
        return edgenote.slug
      })
      .catch(ignoreClientError) // 403 if edit permission was lost
  }
}

export function addEdgenote (slug, data) {
  return { type: 'ADD_EDGENOTE', slug, data }
}

const filterParams = R.pick([
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
  slug,
  contents
) {
  return (dispatch, getState) => {
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
      }).then((edgenote) => dispatch(updateEdgenote(slug, edgenote)))
    )
  }
}

function uploadOrDetach (
  dispatch,
  attachment,
  attribute,
  detachEndpoint
) {
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

function progressBarToastProps (progress) {
  return {
    icon: 'cloud-upload',
    timeout: progress < 100 ? 0 : 2000,
    message: (
      <ProgressBar
        className={progress >= 100 ? 'bp6-no-stripes' : ''}
        intent={progress < 100 ? Intent.PRIMARY : Intent.SUCCESS}
        value={progress / 100}
      />
    ),
  }
}

export function updateEdgenote (
  slug,
  data,
  needsSaving = true
) {
  return { type: 'UPDATE_EDGENOTE', slug, data, needsSaving }
}

export function deleteEdgenote (slug) {
  return (dispatch) => {
    if (
      window.confirm(
        'Are you sure you want to delete this Edgenote? This action cannot be undone.'
      )
    ) {
      return Orchard.prune(`edgenotes/${slug}`)
        .then(() => dispatch(removeEdgenote(slug)))
        .catch(ignoreClientError) // 403 (permission) / 423 (locked) / 404 (gone)
    }
  }
}

export function removeEdgenote (slug) {
  return { type: 'REMOVE_EDGENOTE', slug }
}

export function updateLinkExpansionVisibility (
  edgenoteSlug,
  { noDescription, noEmbed, noImage }
) {
  return () =>
    [noDescription, noEmbed, noImage].some(attribute => attribute != null) &&
    Orchard.espalier(`edgenotes/${edgenoteSlug}/link_expansion`, {
      visibility: { noDescription, noEmbed, noImage },
    })
}

export function highlightEdgenote (
  slug
) {
  return { type: 'HIGHLIGHT_EDGENOTE', slug }
}

export function activateEdgenote (slug) {
  return { type: 'ACTIVATE_EDGENOTE', slug }
}
