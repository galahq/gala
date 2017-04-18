// @flow

export function chooseContentItem (
  returnUrl: string,
  returnData: string,
  itemUrl: string
): void {
  submitForm(returnUrl, contentItemSelectionMessageData(returnData, itemUrl))
}

function contentItemSelectionMessageData (
  returnData: string,
  itemUrl: string
): { [string]: string } {
  const ltiOmniauthCallback = `${location.origin}/authentication_strategies/auth/lti/callback`
  return {
    lti_message_type: 'ContentItemSelection',
    lti_version: 'LTI-1p0',
    data: returnData,
    content_items: JSON.stringify({
      '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
      '@graph': [
        {
          '@type': 'LtiLinkItem',
          url: ltiOmniauthCallback,
          mediaType: 'application/vnd.ims.lti.v1.ltilink',
          title: itemUrl,
          text: itemUrl,
          placementAdvice: {
            presentationDocumentTarget: 'window',
          },
          custom: {
            redirect: itemUrl,
          },
        },
      ],
    }),
  }
}

// Form Submission

function submitForm (action: string, data: { [string]: string }): void {
  const form = document.createElement('form')
  form.action = action
  form.method = 'POST'

  for (const field in data) {
    form.appendChild(buildFormInput(field, data[field]))
  }

  document.body && document.body.appendChild(form)

  form.submit()
}

function buildFormInput (name: string, value: string): HTMLInputElement {
  const el = document.createElement('input')
  el.type = 'hidden'
  el.name = name
  el.value = value
  return el
}
