/**
 * @providesModule LinkedResourceDialog
 *
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Button,
  Dialog,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  TextArea,
} from '@blueprintjs/core'
import { injectIntl } from 'react-intl'
import styled from 'styled-components'
import { Orchard } from 'shared/orchard'
import Markdown from 'utility/Markdown'
import {
  identifierTypes,
  isValidIdentifier,
  normalizeIdentifier,
  orderedConnections,
} from './connections'

const emptyIdentifier = () => ({ type: 'url', value: '' })

const initialForm = resource => ({
  name: resource?.name || '',
  identifiers: resource?.identifiers?.length
    ? resource.identifiers.map(i => ({ ...i }))
    : [emptyIdentifier()],
  connection: resource?.connection || orderedConnections[0],
  connectionOther: resource?.connectionOther || '',
  description: resource?.description || '',
})

const LinkedResourceDialog = ({
  intl,
  isOpen,
  resource,
  position,
  linkedResourcesPath,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState(() => initialForm(resource))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  // Required-field errors only show after a save attempt
  const [submitted, setSubmitted] = useState(false)
  const [focusIdentifier, setFocusIdentifier] = useState(null)

  const nameRef = useRef(null)
  const connectionOtherRef = useRef(null)
  const identifierRefs = useRef([])

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(resource))
      setError(null)
      setSubmitted(false)
    }
  }, [isOpen, resource])

  // After adding or removing an identifier row, move focus to the right field
  useEffect(() => {
    if (focusIdentifier == null) return
    const field = identifierRefs.current[focusIdentifier]
    if (field) field.focus()
    setFocusIdentifier(null)
  }, [focusIdentifier])

  const t = (id, values) =>
    intl.formatMessage({ id: `catalog.linkedResources.${id}` }, values)
  const set = changes => setForm(prev => ({ ...prev, ...changes }))

  const setIdentifier = (index, changes) =>
    set({
      identifiers: form.identifiers.map((identifier, i) =>
        i === index ? { ...identifier, ...changes } : identifier
      ),
    })

  const addIdentifier = () => {
    set({ identifiers: [...form.identifiers, emptyIdentifier()] })
    setFocusIdentifier(form.identifiers.length)
  }

  const removeIdentifier = index => {
    set({ identifiers: form.identifiers.filter((_, j) => j !== index) })
    setFocusIdentifier(Math.max(index - 1, 0))
  }

  const filledIdentifiers = form.identifiers.filter(i => i.value.trim() !== '')
  const isInvalidIdentifier = identifier =>
    identifier.value.trim() !== '' && !isValidIdentifier(identifier)

  const nameMissing = form.name.trim() === ''
  const identifiersMissing = filledIdentifiers.length === 0
  const connectionOtherMissing =
    form.connection === 'other' && form.connectionOther.trim() === ''
  const isValid =
    !nameMissing &&
    !identifiersMissing &&
    !form.identifiers.some(isInvalidIdentifier) &&
    !connectionOtherMissing

  const showNameError = submitted && nameMissing
  const showIdentifiersError = submitted && identifiersMissing
  const showConnectionOtherError = submitted && connectionOtherMissing

  // Save stays enabled (a disabled button can’t be focused or explain itself);
  // an invalid save reveals the errors and focuses the first problem field
  const focusFirstProblem = () => {
    const badIdentifier = form.identifiers.findIndex(isInvalidIdentifier)
    const target = nameMissing
      ? nameRef.current
      : identifiersMissing
        ? identifierRefs.current[0]
        : badIdentifier >= 0
          ? identifierRefs.current[badIdentifier]
          : connectionOtherRef.current
    if (target) target.focus()
  }

  const handleSave = async () => {
    if (!isValid) {
      setSubmitted(true)
      setError(t('fixErrors'))
      focusFirstProblem()
      return
    }

    setSaving(true)
    setError(null)
    const linkedResource = {
      ...form,
      identifiers: filledIdentifiers.map(normalizeIdentifier),
      connectionOther: form.connection === 'other' ? form.connectionOther : null,
      position: resource ? resource.position : position,
    }
    try {
      const response = resource?.id
        ? await Orchard.espalier(`${linkedResourcesPath}/${resource.id}`, {
          linkedResource,
        })
        : await Orchard.graft(linkedResourcesPath, { linkedResource })
      onSaved(response)
      onClose()
    } catch (e) {
      setError(e.message || t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      title={t(resource ? 'editDialogTitle' : 'addDialogTitle')}
      className="bp6-dark"
      onClose={onClose}
    >
      <div className="bp6-dialog-body">
        <FormGroup
          label={t('name')}
          labelFor="linked-resource-name"
          labelInfo={t('required')}
          intent={showNameError ? Intent.DANGER : Intent.NONE}
          helperText={
            showNameError && <span id="linked-resource-name-error">{t('nameRequired')}</span>
          }
        >
          <InputGroup
            id="linked-resource-name"
            inputRef={nameRef}
            value={form.name}
            placeholder={t('namePlaceholder')}
            intent={showNameError ? Intent.DANGER : Intent.NONE}
            aria-required="true"
            aria-invalid={showNameError}
            aria-describedby={showNameError ? 'linked-resource-name-error' : undefined}
            onChange={e => set({ name: e.target.value })}
          />
        </FormGroup>

        <Fieldset
          className="bp6-form-group"
          aria-describedby="linked-resource-identifiers-instructions"
        >
          <legend className="bp6-label">
            {t('identifiers')}{' '}
            <span className="bp6-text-muted">{t('required')}</span>
          </legend>
          <InstructionsCallout id="linked-resource-identifiers-instructions">
            <Markdown source={t('identifiersInstructions')} />
          </InstructionsCallout>
          {form.identifiers.map((identifier, i) => {
            const invalid = isInvalidIdentifier(identifier)
            const missing = showIdentifiersError && i === 0
            const errorId = `linked-resource-identifier-${i}-error`
            return (
              <IdentifierRow key={i}>
                <div className="bp6-control-group bp6-fill">
                  <HTMLSelect
                    className="bp6-fixed"
                    value={identifier.type}
                    aria-label={t('identifierTypeLabel', { number: i + 1 })}
                    options={identifierTypes.map(type => ({
                      value: type,
                      label: t(`identifierTypes.${type}`),
                    }))}
                    onChange={e => setIdentifier(i, { type: e.target.value })}
                  />
                  <InputGroup
                    inputRef={el => { identifierRefs.current[i] = el }}
                    value={identifier.value}
                    intent={invalid || missing ? Intent.DANGER : Intent.NONE}
                    placeholder={t(`identifierPlaceholders.${identifier.type}`)}
                    aria-label={t('identifierValueLabel', { number: i + 1 })}
                    aria-required={i === 0 ? 'true' : undefined}
                    aria-invalid={invalid || missing}
                    aria-describedby={invalid || missing ? errorId : undefined}
                    onChange={e => setIdentifier(i, { value: e.target.value })}
                  />
                  {form.identifiers.length > 1 && (
                    <Button
                      className="bp6-fixed"
                      icon="cross"
                      aria-label={t('removeIdentifierNumber', { number: i + 1 })}
                      title={t('removeIdentifierNumber', { number: i + 1 })}
                      onClick={() => removeIdentifier(i)}
                    />
                  )}
                </div>
                {(invalid || missing) && (
                  <div id={errorId} className="bp6-form-helper-text bp6-intent-danger">
                    {invalid ? t('invalidIdentifier') : t('identifiersRequired')}
                  </div>
                )}
              </IdentifierRow>
            )
          })}
          <Button
            minimal
            icon="add"
            text={t('addIdentifier')}
            onClick={addIdentifier}
          />
        </Fieldset>

        <FormGroup label={t('connection')} labelFor="linked-resource-connection">
          <HTMLSelect
            id="linked-resource-connection"
            value={form.connection}
            options={orderedConnections.map(connection => ({
              value: connection,
              label: t(`connections.${connection}`),
            }))}
            onChange={e => set({ connection: e.target.value })}
          />
        </FormGroup>

        {form.connection === 'other' && (
          <FormGroup
            label={t('connectionOther')}
            labelFor="linked-resource-connection-other"
            labelInfo={t('required')}
            intent={showConnectionOtherError ? Intent.DANGER : Intent.NONE}
            helperText={
              showConnectionOtherError && (
                <span id="linked-resource-connection-other-error">
                  {t('connectionOtherRequired')}
                </span>
              )
            }
          >
            <InputGroup
              id="linked-resource-connection-other"
              inputRef={connectionOtherRef}
              value={form.connectionOther}
              placeholder={t('connectionOtherPlaceholder')}
              intent={showConnectionOtherError ? Intent.DANGER : Intent.NONE}
              aria-required="true"
              aria-invalid={showConnectionOtherError}
              aria-describedby={
                showConnectionOtherError
                  ? 'linked-resource-connection-other-error'
                  : undefined
              }
              onChange={e => set({ connectionOther: e.target.value })}
            />
          </FormGroup>
        )}

        <FormGroup label={t('description')} labelFor="linked-resource-description">
          <TextArea
            fill
            id="linked-resource-description"
            value={form.description}
            placeholder={t('descriptionPlaceholder')}
            onChange={e => set({ description: e.target.value })}
          />
        </FormGroup>

        {/* Always rendered so screen readers announce the message when it appears */}
        <div role="alert">
          {error && (
            <div className="bp6-callout bp6-intent-danger" style={{ whiteSpace: 'pre-line' }}>
              {error}
            </div>
          )}
        </div>
      </div>
      <div className="bp6-dialog-footer">
        <div className="bp6-dialog-footer-actions">
          <Button text={intl.formatMessage({ id: 'helpers.cancel' })} onClick={onClose} />
          <Button
            intent={Intent.SUCCESS}
            text={intl.formatMessage({ id: 'helpers.save' })}
            loading={saving}
            onClick={handleSave}
          />
        </div>
      </div>
    </Dialog>
  )
}

// Links use the same green as .my-cases__link ($lightGreen); `&&` outranks
// the global dark-surface purple (`.bp6-dark a`)
const InstructionsCallout = styled.div.attrs({
  className: 'bp6-callout bp6-dark bp6-icon-hand-right',
})`
  margin-bottom: 10px;

  && a,
  && a:hover {
    color: #6acb72;
  }
`

const Fieldset = styled.fieldset`
  border: 0;
  margin-left: 0;
  margin-right: 0;
  min-width: 0;
  padding: 0;

  legend {
    padding: 0;
  }
`

const IdentifierRow = styled.div`
  margin-bottom: 8px;

  .bp6-html-select {
    min-width: 130px;
  }
`

export default injectIntl(LinkedResourceDialog)
