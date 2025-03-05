/**
 * Javascript sprinkles to allow ActiveStorage to directly upload attachments
 * and to replace placeholders with filenames and file inputs with progress
 * bars while that is taking place.
 *
 * NOTE: This is for use with HTML forms, not React components.
 *
 * @flow
 */

import * as ActiveStorage from 'activestorage'

import html from 'shared/html'

const filenameFromPath = path =>
  path
    .split('\\')
    .pop()
    .split('/')
    .pop()

// Display the filename in Blueprint file inputs when a user has selected one
document.querySelectorAll('.bp3-file-input').forEach(fileInput => {
  const hiddenInput = fileInput.querySelector('input[type=file]')
  const displayElement = fileInput.querySelector('.bp3-file-upload-input')
  if (hiddenInput == null || displayElement == null) return

  hiddenInput.addEventListener('change', e => {
    if (!(e.currentTarget instanceof HTMLInputElement)) return
    const path = e.currentTarget.value
    displayElement.innerText = filenameFromPath(path)
  })
})

// Allow ActiveStorage to intercept form submits and upload files
ActiveStorage.start()

addEventListener('direct-upload:initialize', ({ target, detail }) => {
  const { id, file } = detail
  target.insertAdjacentHTML(
    'beforebegin',
    html`
      <div>
        Uploading ${file.name}...
        <div class="bp3-progress-bar bp3-intent-primary">
          <div
            id="direct-upload-progress-${id}"
            class="bp3-progress-meter"
            style="width: 0%"
          />
        </div>
      </div>
    `
  )
})

addEventListener('direct-upload:progress', ({ detail }) => {
  const { id, progress } = detail
  const progressBar = document.getElementById(`direct-upload-progress-${id}`)
  if (progressBar == null) return
  progressBar.style.width = `${progress}%`
})

addEventListener('direct-upload:end', ({ detail }) => {
  const { id } = detail
  const progressBar = document.getElementById(`direct-upload-progress-${id}`)
  if (progressBar == null) return

  progressBar.style.width = '100%'
  progressBar.classList.add('bp3-no-animation')
})
