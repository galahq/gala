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
  Spinner,
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
import lookupName, {
  FOUND,
  NOT_FOUND,
  UNCHECKED,
  lookupable,
  lookupIdentifier,
  lookupKey,
} from './lookupName'

// Wait for a pause in typing before looking up an identifier’s name
const LOOKUP_DELAY = 400

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
  // Lookup results by identifier, e.g. { 'doi:10.1000/x': { status, name } };
  // an entry with no status is still pending
  const [lookups, setLookups] = useState({})
  // The identifier type the name was filled in from, while it’s unedited
  const [autofilledFrom, setAutofilledFrom] = useState(null)

  const nameRef = useRef(null)
  const connectionOtherRef = useRef(null)
  const identifierRefs = useRef([])
  // The last name we filled in, so we can tell it apart from a typed one
  const autofilledNameRef = useRef(null)
  const nameValueRef = useRef(form.name)
  nameValueRef.current = form.name

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(resource))
      setError(null)
      setSubmitted(false)
      setAutofilledFrom(null)
      setLookups({})
      autofilledNameRef.current = null
    }
  }, [isOpen, resource])

  // Look up every DOI and Wikidata QID: the first one’s name fills in the
  // resource name, and any that don’t resolve get a warning
  const keysToLookUp = [
    ...new Set(
      form.identifiers.map(lookupable).filter(Boolean).map(lookupKey)
    ),
  ]
  const lookupsRef = useRef(lookups)
  lookupsRef.current = lookups
  const controllersRef = useRef([])

  // Cancel any lookups still running when the dialog closes
  useEffect(() => {
    if (isOpen) return undefined
    controllersRef.current.forEach(controller => controller.abort())
    controllersRef.current = []
    return undefined
  }, [isOpen])
  useEffect(() => () => {
    controllersRef.current.forEach(controller => controller.abort())
  }, [])

  // Wait for a pause in typing, then look up anything not already looked up.
  // Identifiers we couldn’t check (the registry was down or rate limited) are
  // tried again whenever the identifiers change
  useEffect(() => {
    if (!isOpen || keysToLookUp.length === 0) return undefined

    const timeout = setTimeout(() => {
      const keys = keysToLookUp.filter(key => {
        const lookup = lookupsRef.current[key]
        return !lookup || lookup.status === UNCHECKED
      })
      if (keys.length === 0) return
      setLookups(prev => {
        const next = { ...prev }
        keys.forEach(key => { next[key] = {} })
        return next
      })
      keys.forEach(async key => {
        const separator = key.indexOf(':')
        const identifier = {
          type: key.slice(0, separator),
          value: key.slice(separator + 1),
        }
        const controller = new AbortController()
        controllersRef.current.push(controller)
        try {
          const result = await lookupName(identifier, {
            locale: intl.locale,
            signal: controller.signal,
          })
          setLookups(prev => ({ ...prev, [key]: result }))
        } catch (e) {
          // Aborted because the dialog closed
        } finally {
          controllersRef.current = controllersRef.current.filter(
            c => c !== controller
          )
        }
      })
    }, LOOKUP_DELAY)

    return () => clearTimeout(timeout)
  }, [isOpen, keysToLookUp.join(' '), intl.locale])

  // Fill in the name from the first DOI or QID once it resolves, unless the
  // author has typed a name of their own
  const canFill = name =>
    name.trim() === '' || name === autofilledNameRef.current
  const firstIdentifier = lookupIdentifier(form.identifiers)
  const firstLookup = firstIdentifier && lookups[lookupKey(firstIdentifier)]

  useEffect(() => {
    const name = firstLookup?.status === FOUND && firstLookup.name
    if (!name || !canFill(nameValueRef.current)) return
    autofilledNameRef.current = name
    setAutofilledFrom(firstIdentifier.type)
    setForm(prev => (canFill(prev.name) ? { ...prev, name } : prev))
  }, [firstLookup])

  const lookingUp =
    !!firstIdentifier && !firstLookup?.status && canFill(form.name)

  const lookupStatus = identifier => {
    const normalized = lookupable(identifier)
    return normalized ? lookups[lookupKey(normalized)]?.status : undefined
  }

  const nameIsAutofilled =
    autofilledFrom != null && form.name === autofilledNameRef.current

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
    const target = identifiersMissing
      ? identifierRefs.current[0]
      : badIdentifier >= 0
        ? identifierRefs.current[badIdentifier]
        : nameMissing
          ? nameRef.current
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
            const status = lookupStatus(identifier)
            const notFound = status === NOT_FOUND
            const unchecked = status === UNCHECKED
            const warningId = `linked-resource-identifier-${i}-warning`
            const type = t(`identifierTypes.${identifier.type}`)
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
                    intent={
                      invalid || missing
                        ? Intent.DANGER
                        : notFound
                          ? Intent.WARNING
                          : Intent.NONE
                    }
                    placeholder={t(`identifierPlaceholders.${identifier.type}`)}
                    aria-label={t('identifierValueLabel', { number: i + 1 })}
                    aria-required={i === 0 ? 'true' : undefined}
                    aria-invalid={invalid || missing}
                    aria-describedby={
                      invalid || missing
                        ? errorId
                        : notFound || unchecked
                          ? warningId
                          : undefined
                    }
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
                {invalid || missing ? (
                  <div id={errorId} className="bp6-form-helper-text bp6-intent-danger">
                    {invalid ? t('invalidIdentifier') : t('identifiersRequired')}
                  </div>
                ) : notFound ? (
                  <div id={warningId} className="bp6-form-helper-text bp6-intent-warning">
                    {t('identifierNotFound', { type })}
                  </div>
                ) : unchecked ? (
                  <div id={warningId} className="bp6-form-helper-text bp6-text-muted">
                    {t('identifierUnchecked', { type })}
                  </div>
                ) : null}
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

        <FormGroup
          label={t('name')}
          labelFor="linked-resource-name"
          labelInfo={t('required')}
          intent={showNameError ? Intent.DANGER : Intent.NONE}
          helperText={
            showNameError ? (
              <span id="linked-resource-name-error">{t('nameRequired')}</span>
            ) : nameIsAutofilled ? (
              <span id="linked-resource-name-autofilled">
                {t('nameAutofilled', {
                  source: t(`identifierTypes.${autofilledFrom}`),
                })}
              </span>
            ) : null
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
            aria-describedby={
              showNameError
                ? 'linked-resource-name-error'
                : nameIsAutofilled
                  ? 'linked-resource-name-autofilled'
                  : undefined
            }
            aria-busy={lookingUp}
            rightElement={
              lookingUp ? (
                <LookupSpinner
                  size={16}
                  aria-label={t('lookingUpName')}
                />
              ) : undefined
            }
            onChange={e => set({ name: e.target.value })}
          />
        </FormGroup>

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

const LookupSpinner = styled(Spinner)`
  margin: 7px;
`

const IdentifierRow = styled.div`
  margin-bottom: 8px;

  .bp6-html-select {
    min-width: 130px;
  }
`

export default injectIntl(LinkedResourceDialog)
