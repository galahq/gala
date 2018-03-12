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
import type { ChangesToAttachments } from 'edgenotes/EdgenoteEditor'
import type { Edgenote, ExtractReturn } from 'redux/state'

type FormContents = { ...Edgenote, ...ChangesToAttachments }

type Props = {
  contents: FormContents,
  intl: IntlShape,
  onChange: ($Shape<Edgenote>) => mixed,
  onChangeAttachment: ($Keys<ChangesToAttachments>, ?FileList) => mixed,
}

const EdgenoteForm = ({
  contents,
  intl,
  onChange,
  onChangeAttachment,
}: Props) => {
  const disabled = shouldDisable(contents)
  const commonProps = { contents, disabled, intl, onChange, onChangeAttachment }
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

      <FileField
        name="audioUrl"
        accept="audio/*"
        placeholder="edgenotes.edit.chooseAudioFile"
        {...commonProps}
      />

      {/* ~~~---~~~ */}

      <Heading messageId="edgenotes.edit.attachAnImage" />

      <FileField
        name="imageUrl"
        accept="image/*"
        placeholder="edgenotes.edit.chooseImage"
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

type CommonFieldProps = {
  contents: *,
  disabled: *,
  intl: IntlShape,
  onChange: *,
  onChangeAttachment: *,
  label?: string,
  helperText?: React.Node,
  placeholder?: string,
}

type FieldProps = CommonFieldProps & {
  name: $Keys<ExtractReturn<typeof shouldDisable>>,
  render: ({
    disabled: boolean,
    placeholder?: string,
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
  placeholder,
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
      placeholder: placeholder && intl.formatMessage({ id: placeholder }),
      onChange: (e: SyntheticInputEvent<*>) =>
        onChange({ [name]: e.target.value }),
    })}
  </FormGroup>
)

const Input = styled.input.attrs({ className: 'pt-input pt-fill' })``
const TextArea = Input.withComponent('textarea')

const FileField = (
  props: CommonFieldProps & {
    name: $Keys<ChangesToAttachments>,
    accept: string,
  }
) => {
  const attachment = props.contents[props.name]
  const fileList = attachment && attachment.fileList
  return (
    <Field
      {...props}
      render={({ disabled, placeholder }) => (
        <label className="pt-file-upload pt-fill">
          <input
            accept={props.accept}
            type="file"
            disabled={disabled}
            onChange={(e: SyntheticInputEvent<*>) =>
              props.onChangeAttachment(props.name, e.target.files)
            }
          />
          <span className="pt-file-upload-input">
            {fileList && fileList.length > 0
              ? fileList.item(0).name
              : placeholder}
          </span>
        </label>
      )}
    />
  )
}

const shouldDisable = (contents: { ...Edgenote, ...ChangesToAttachments }) => ({
  websiteUrl: !!contents.audioUrl,

  pullQuote: !!contents.imageUrl,
  attribution: !contents.pullQuote && !contents.attribution,
  audioUrl: !contents.pullQuote || !!contents.websiteUrl,

  imageUrl:
    !!contents.pullQuote || !!contents.attribution || !!contents.audioUrl,
  altText: !contents.imageUrl,
  photoCredit: !contents.imageUrl,

  caption: false,
  callToAction: !!contents.audioUrl,
})
