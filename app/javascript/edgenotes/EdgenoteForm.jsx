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
import type { Edgenote, ExtractReturn } from 'redux/state'

type Props = {
  contents: Edgenote,
  intl: IntlShape,
  onChange: ($Shape<Edgenote>) => any,
}

const EdgenoteForm = ({ contents, intl, onChange }: Props) => {
  const disabled = shouldDisable(contents)
  const commonProps = { contents, disabled, intl, onChange }
  return (
    <React.Fragment>
      <Heading messageId="edgenotes.edit.pasteALink" />

      <Field
        name="websiteUrl"
        helperText={
          <Markdown
            source={intl.formatMessage({
              id: 'edgenotes.edit.embedOrExternalLink',
            })}
          />
        }
        render={props => <Input {...props} />}
        {...commonProps}
      />

      {/* ~~~---~~~ */}

      <Heading messageId="edgenotes.edit.pullAQuote" />

      <Field
        name="pullQuote"
        label="activerecord.attributes.edgenote.pullQuote"
        render={props => <TextArea {...props} />}
        {...commonProps}
      />

      <Field
        name="attribution"
        label="activerecord.attributes.edgenote.attribution"
        render={props => <Input {...props} />}
        {...commonProps}
      />

      <Field
        name="audioUrl"
        label="edgenotes.edit.uploadAnAudioFile"
        render={({ disabled, onChange }) => (
          <label className="pt-file-upload pt-fill">
            <input type="file" {...{ disabled, onChange }} />
            <span className="pt-file-upload-input">
              <FormattedMessage id="edgenotes.edit.chooseAudioFile" />
            </span>
          </label>
        )}
        {...commonProps}
      />

      {/* ~~~---~~~ */}

      <Heading messageId="edgenotes.edit.attachAnImage" />

      <Field
        name="imageUrl"
        render={({ disabled, onChange }) => (
          <label className="pt-file-upload pt-fill">
            <input type="file" {...{ disabled, onChange }} />
            <span className="pt-file-upload-input">
              <FormattedMessage id="edgenotes.edit.chooseImage" />
            </span>
          </label>
        )}
        {...commonProps}
      />

      <Field
        name="altText"
        label="activerecord.attributes.edgenote.altText"
        helperText={
          <Markdown
            source={intl.formatMessage({
              id: 'edgenotes.edit.altTextGuidelines',
            })}
          />
        }
        render={props => <TextArea {...props} />}
        {...commonProps}
      />

      <Field
        name="photoCredit"
        label="activerecord.attributes.edgenote.photoCredit"
        render={props => <Input {...props} />}
        {...commonProps}
      />

      {/* ~~~---~~~ */}

      <Heading messageId="edgenotes.edit.writeACaption" />

      <Field
        name="caption"
        label="activerecord.attributes.edgenote.caption"
        render={props => <TextArea {...props} />}
        {...commonProps}
      />

      <Field
        name="callToAction"
        label="activerecord.attributes.edgenote.callToAction"
        render={props => <Input {...props} />}
        {...commonProps}
      />
    </React.Fragment>
  )
}
export default EdgenoteForm

const Heading = ({ messageId }: { messageId: string }) => (
  <h5>
    <FormattedMessage id={messageId} />
  </h5>
)

type FieldProps = {
  contents: Edgenote,
  disabled: *,
  intl: IntlShape,
  onChange: ($Shape<Edgenote>) => any,
  label?: string,
  helperText?: React.Node,
  name: $Keys<ExtractReturn<typeof shouldDisable>>,
  render: ({
    disabled: boolean,
    value: string,
    onChange: (SyntheticInputEvent<*>) => any,
  }) => React.Node,
}

const Field = ({
  contents,
  disabled,
  intl,
  onChange,
  label,
  helperText,
  name,
  render,
}: FieldProps) => (
  <FormGroup
    disabled={disabled[name]}
    helperText={helperText}
    label={label && intl.formatMessage({ id: label })}
  >
    {render({
      disabled: disabled[name],
      value: contents[name] || '',
      onChange: (e: SyntheticInputEvent<*>) =>
        onChange({ [name]: e.target.value }),
    })}
  </FormGroup>
)

const Input = styled.input.attrs({ className: 'pt-input pt-fill' })``
const TextArea = Input.withComponent('textarea')

const shouldDisable = (contents: Edgenote) => ({
  websiteUrl: !!contents.audioUrl,

  pullQuote: !!contents.imageUrl,
  attribution: !contents.pullQuote,
  audioUrl: !contents.pullQuote || !!contents.websiteUrl,

  imageUrl: !!contents.pullQuote,
  altText: !contents.imageUrl,
  photoCredit: !contents.imageUrl,

  caption: false,
  callToAction: !!contents.audioUrl,
})
