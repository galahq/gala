/**
 *
 */

export function chooseContentItem (
  returnUrl,
  returnData,
  itemUrl
) {
  submitForm(returnUrl, contentItemSelectionMessageData(returnData, itemUrl))
}

function contentItemSelectionMessageData (
  returnData,
  itemUrl
) {
  return {
    lti_message_type: 'ContentItemSelection',
    lti_version: 'LTI-1p0',
    data: returnData,
    content_items: JSON.stringify({
      '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
      '@graph': [
        {
          '@type': 'LtiLinkItem',
          url: itemUrl,
          mediaType: 'application/vnd.ims.lti.v1.ltilink',
          placementAdvice: {
            presentationDocumentTarget: 'window',
          },
        },
      ],
    }),
  }
}

// Form Submission

export function submitForm (action, data) {
  const form = document.createElement('form')
  form.action = action
  form.method = 'POST'

  for (const field in data) {
    form.appendChild(buildFormInput(field, data[field]))
  }

  document.body && document.body.appendChild(form)

  form.submit()
}

function buildFormInput (name, value) {
  const el = document.createElement('input')
  el.type = 'hidden'
  el.name = name
  el.value = value
  return el
}
