/**
 * Form allowing all the attributes of Edgenotes to be set.
 *
 * @providesModule EdgenoteForm
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

import { FormattedMessage } from 'react-intl'
import { FormGroup } from '@blueprintjs/core'
import Markdown from 'utility/Markdown'

import type { IntlShape } from 'react-intl'

type Props = { intl: IntlShape }

const EdgenoteForm = ({ intl }: Props) => (
  <React.Fragment>
    <h5>
      <FormattedMessage id="edgenotes.edit.pasteALink" />
    </h5>
    <FormGroup
      helperText={
        <Markdown
          source={intl.formatMessage({
            id: 'edgenotes.edit.embedOrExternalLink',
          })}
        />
      }
    >
      <Input />
    </FormGroup>

    <h5>
      <FormattedMessage id="edgenotes.edit.pullAQuote" />
    </h5>
    <FormGroup
      label={intl.formatMessage({
        id: 'activerecord.attributes.edgenote.pullQuote',
      })}
    >
      <TextArea />
    </FormGroup>
    <FormGroup
      label={intl.formatMessage({
        id: 'activerecord.attributes.edgenote.attribution',
      })}
    >
      <Input />
    </FormGroup>
    <FormGroup
      label={intl.formatMessage({ id: 'edgenotes.edit.uploadAnAudioFile' })}
    >
      <label className="pt-file-upload pt-fill">
        <input type="file" />
        <span className="pt-file-upload-input">
          <FormattedMessage id="edgenotes.edit.chooseAudioFile" />
        </span>
      </label>
    </FormGroup>

    <h5>
      <FormattedMessage id="edgenotes.edit.attachAnImage" />
    </h5>
    <FormGroup>
      <label className="pt-file-upload pt-fill">
        <input type="file" />
        <span className="pt-file-upload-input">
          <FormattedMessage id="edgenotes.edit.chooseImage" />
        </span>
      </label>
    </FormGroup>
    <FormGroup
      label={intl.formatMessage({
        id: 'activerecord.attributes.edgenote.altText',
      })}
      helperText={
        <Markdown
          source={intl.formatMessage({
            id: 'edgenotes.edit.altTextGuidelines',
          })}
        />
      }
    >
      <TextArea />
    </FormGroup>
    <FormGroup
      label={intl.formatMessage({
        id: 'activerecord.attributes.edgenote.photoCredit',
      })}
    >
      <Input />
    </FormGroup>

    <h5>
      <FormattedMessage id="edgenotes.edit.writeACaption" />
    </h5>
    <FormGroup
      label={intl.formatMessage({
        id: 'activerecord.attributes.edgenote.caption',
      })}
    >
      <Input />
    </FormGroup>
    <FormGroup
      label={intl.formatMessage({
        id: 'activerecord.attributes.edgenote.callToAction',
      })}
    >
      <Input />
    </FormGroup>
  </React.Fragment>
)
export default EdgenoteForm

const Input = styled.input.attrs({ className: 'pt-input pt-fill' })``
const TextArea = Input.withComponent('textarea')
