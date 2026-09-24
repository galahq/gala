/**
 * @providesModule LinkedResourceDialog
 *
 */

import React, { useState, useEffect } from 'react'
import {
  Button,
  Dialog,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  MenuItem,
  TextArea,
} from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
import { injectIntl, FormattedMessage } from 'react-intl'
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

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(resource))
      setError(null)
    }
  }, [isOpen, resource])

  const t = id => intl.formatMessage({ id: `catalog.linkedResources.${id}` })
  const set = changes => setForm(prev => ({ ...prev, ...changes }))

  const setIdentifier = (index, changes) =>
    set({
      identifiers: form.identifiers.map((identifier, i) =>
        i === index ? { ...identifier, ...changes } : identifier
      ),
    })

  const filledIdentifiers = form.identifiers.filter(i => i.value.trim() !== '')
  const isValid =
    form.name.trim() !== '' &&
    filledIdentifiers.length > 0 &&
    filledIdentifiers.every(isValidIdentifier) &&
    (form.connection !== 'other' || form.connectionOther.trim() !== '')

  const handleSave = async () => {
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
        <FormGroup label={t('name')} labelFor="linked-resource-name">
          <InputGroup
            id="linked-resource-name"
            value={form.name}
            placeholder={t('namePlaceholder')}
            onChange={e => set({ name: e.target.value })}
          />
        </FormGroup>

        <FormGroup label={t('identifiers')}>
          <InstructionsCallout>
            <Markdown source={t('identifiersInstructions')} />
          </InstructionsCallout>
          {form.identifiers.map((identifier, i) => {
            const invalid =
              identifier.value.trim() !== '' && !isValidIdentifier(identifier)
            return (
              <IdentifierRow key={i}>
                <div className="bp6-control-group bp6-fill">
                  <HTMLSelect
                    className="bp6-fixed"
                    value={identifier.type}
                    options={identifierTypes.map(type => ({
                      value: type,
                      label: t(`identifierTypes.${type}`),
                    }))}
                    onChange={e => setIdentifier(i, { type: e.target.value })}
                  />
                  <InputGroup
                    value={identifier.value}
                    intent={invalid ? Intent.DANGER : Intent.NONE}
                    placeholder={t(`identifierPlaceholders.${identifier.type}`)}
                    onChange={e => setIdentifier(i, { value: e.target.value })}
                  />
                  {form.identifiers.length > 1 && (
                    <Button
                      className="bp6-fixed"
                      icon="cross"
                      title={t('removeIdentifier')}
                      onClick={() =>
                        set({
                          identifiers: form.identifiers.filter((_, j) => j !== i),
                        })
                      }
                    />
                  )}
                </div>
                {invalid && (
                  <div className="bp6-form-helper-text bp6-intent-danger">
                    <FormattedMessage id="catalog.linkedResources.invalidIdentifier" />
                  </div>
                )}
              </IdentifierRow>
            )
          })}
          <Button
            minimal
            icon="add"
            text={t('addIdentifier')}
            onClick={() =>
              set({ identifiers: [...form.identifiers, emptyIdentifier()] })
            }
          />
        </FormGroup>

        <FormGroup label={t('connection')}>
          <div style={{ width: '180px' }}>
            <Select
              className="bp6-select bp6-fill bp6-dark"
              filterable={false}
              items={orderedConnections}
              itemRenderer={(item, { handleClick, modifiers: { active } }) => (
                <MenuItem
                  active={active}
                  key={item}
                  text={t(`connections.${item}`)}
                  onClick={handleClick}
                />
              )}
              popoverProps={{
                minimal: true,
                captureDismiss: true,
                usePortal: false,
              }}
              onItemSelect={connection => set({ connection })}
            >
              <Button
                className="bp6-fill bp6-dark"
                endIcon="double-caret-vertical"
                text={t(`connections.${form.connection}`)}
              />
            </Select>
          </div>
        </FormGroup>

        {form.connection === 'other' && (
          <FormGroup label={t('connectionOther')} labelFor="linked-resource-connection-other">
            <InputGroup
              id="linked-resource-connection-other"
              value={form.connectionOther}
              placeholder={t('connectionOtherPlaceholder')}
              onChange={e => set({ connectionOther: e.target.value })}
            />
          </FormGroup>
        )}

        <FormGroup label={t('description')} labelFor="linked-resource-description">
          <TextArea
            id="linked-resource-description"
            fill
            value={form.description}
            placeholder={t('descriptionPlaceholder')}
            onChange={e => set({ description: e.target.value })}
          />
        </FormGroup>

        {error && (
          <div className="bp6-callout bp6-intent-danger" style={{ whiteSpace: 'pre-line' }}>
            {error}
          </div>
        )}
      </div>
      <div className="bp6-dialog-footer">
        <div className="bp6-dialog-footer-actions">
          <Button text="Cancel" onClick={onClose} />
          <Button
            intent={Intent.SUCCESS}
            text={intl.formatMessage({ id: 'helpers.save' })}
            disabled={!isValid || saving}
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

const IdentifierRow = styled.div`
  margin-bottom: 8px;

  .bp6-html-select {
    min-width: 130px;
  }
`

export default injectIntl(LinkedResourceDialog)
