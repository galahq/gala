/**
 * Form allowing all the attributes of Edgenotes to be set.
 *
 * @providesModule EdgenoteForm
 * 
 */

import * as React from 'react'
import styled from 'styled-components'

import { FormattedMessage } from 'react-intl'
import { Button, FormGroup, Intent } from '@blueprintjs/core'

import Attachment from './Attachment'
import Markdown from 'utility/Markdown'
import { IconChooser } from 'utility/Icon'
import { ensureHttp } from 'shared/functions'




const EdgenoteForm = ({
  contents,
  expansion,
  intl,
  onChange,
  onChangeAttachment,
}) => {
  const disabled = shouldDisable(contents, expansion)
  const commonProps = { contents, disabled, intl, onChange, onChangeAttachment }
  return (
    <>
      <label htmlFor="websiteUrl">
        <Heading id="pasteALink" messageId="edgenotes.edit.pasteALink" />
      </label>

      <Field
        name="websiteUrl"
        helperText={
          <Markdown
            source={intl.formatMessage({
              id: 'edgenotes.edit.embedOrExternalLink',
            })}
          />
        }
        render={props => (
          <Input
            {...props}
            onBlur={() =>
              props.value && onChange({ websiteUrl: ensureHttp(props.value) })
            }
          />
        )}
        {...commonProps}
        onChange={(edgenote) => { onChange(edgenote) }
        }
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
        helperText={
          <Markdown
            source={intl.formatMessage({
              id: 'edgenotes.edit.attribution',
            })}
          />
        }
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
        helperText={
          <FormattedMessage
            id="helpers.attachments.maxSize.js"
            values={{ mb: 2 }}
          />
        }
        {...commonProps}
      />
      {/* altText initializes as null but is empty string when modified and deleted */}
      <Field
        name="altText"
        label="activerecord.attributes.edgenote.altText"
        intent={(contents.photoCredit && contents.photoCredit.length) ? Intent.NONE : Intent.DANGER}
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
        intent={(contents.photoCredit && contents.photoCredit.length) ? Intent.NONE : Intent.DANGER}
        render={props => <Input {...props} />}
        helperText={
          <Markdown
            source={intl.formatMessage({
              id: 'edgenotes.edit.photoCreditGuidelines',
            })}
          />
        }
        {...commonProps}
      />

      {/* ~~~---~~~ */}

      <Heading messageId="edgenotes.edit.attachAFile" />

      <FileField
        name="fileUrl"
        placeholder="edgenotes.edit.chooseFile"
        {...commonProps}
      />

      <Field
        name="iconSlug"
        label="activerecord.attributes.edgenote.iconSlug"
        render={({ onChange, value, ...props }) => (
          <IconChooser
            icons={[
              'file-basic',
              'file-audio',
              'file-code',
              'file-data',
              'file-image',
              'file-model',
              'file-shapes',
              'file-spreadsheet',
              'file-tasks',
              'file-text',
              'file-video',
            ]}
            value={value || 'file-basic'}
            {...props}
            onChange={iconSlug =>
              onChange(({ target: { value: iconSlug }}))
            }
          />
        )}
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
    </>
  )
}
export default EdgenoteForm

const Heading = ({ messageId }) => (
  <h5>
    <FormattedMessage id={messageId} />
  </h5>
)



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
  intent,
}) => (
  <FormGroup
    disabled={disabled[name]}
    helperText={helperText}
    label={label && intl.formatMessage({ id: label })}
    labelFor={name}
    className={intent}
  >
    {render({
      disabled: disabled[name],
      id: name,
      value: contents[name] || '',
      placeholder: placeholder && intl.formatMessage({ id: placeholder }),
      onChange: (e) =>
        onChange({ [name]: e.target.value }),
    })}
  </FormGroup>
)

const Input = styled.input.attrs({ className: 'bp6-input bp6-fill' })``
const TextArea = Input.withComponent('textarea')

const FileField = (
  props) => {
  const attachment = props.contents[props.name]
  const fileList = attachment instanceof Attachment && attachment.fileList
  return (
    <Row>
      <Field
        {...props}
        render={({ disabled, placeholder }) => (
          <label className="bp6-file-input bp6-fill">
            <input
              accept={props.accept}
              type="file"
              disabled={disabled}
              onChange={(e) =>
                props.onChangeAttachment(props.name, e.target.files)
              }
            />
            <span className="bp6-file-upload-input">
              {fileList && fileList.length > 0
                ? fileList.item(0).name
                : placeholder}
            </span>
          </label>
        )}
      />

      {Attachment.truthy(attachment) && (
        <Button
          intent={Intent.DANGER}
          icon="trash"
          onClick={() => props.onChangeAttachment(props.name, null)}
        >
          <FormattedMessage id="edgenotes.edit.remove" />
        </Button>
      )}
    </Row>
  )
}

const shouldDisable = (
  contents,
  expansion
) => ({
  websiteUrl:
    Attachment.truthy(contents.audioUrl) || Attachment.truthy(contents.fileUrl),

  pullQuote:
    Attachment.truthy(contents.imageUrl) ||
    Attachment.truthy(contents.fileUrl) ||
    expansion.hasEmbed,
  attribution: !contents.pullQuote && !contents.attribution,
  audioUrl: !contents.pullQuote || !!contents.websiteUrl,

  imageUrl:
    !!contents.pullQuote ||
    !!contents.attribution ||
    Attachment.truthy(contents.audioUrl) ||
    expansion.hasEmbed,
  altText: !Attachment.truthy(contents.imageUrl),
  photoCredit: !Attachment.truthy(contents.imageUrl),

  fileUrl: !!contents.websiteUrl || !!contents.pullQuote,
  iconSlug: !Attachment.truthy(contents.fileUrl),

  caption: false,

})

const Row = styled.div`
  display: flex;
  align-items: flex-start;

  .bp6-form-group label.bp6-label:empty {
    margin-bottom: 0;
  }

  .bp6-form-group {
    flex: 1;
  }

  .bp6-button {
    margin: 0 0 15px 6px;
  }
`
