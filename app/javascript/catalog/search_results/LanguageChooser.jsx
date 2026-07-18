/**
 * MultiSelect dropdown to present language suggestions.
 *
 * @providesModule LanguageChooser
 *
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'
import { MenuItem } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'
import { Orchard } from 'shared/orchard'

function LanguageChooser({ intl, onChange, languages }) {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  const isLanguageSelected = React.useCallback((language) =>
    languages.map(l => l.code).includes(language.code), [languages]
  )

  const renderMenuItem = React.useCallback((
    language,
    { handleClick, modifiers: { active, disabled, matchesPredicate }, ref }
  ) => {
    if (!matchesPredicate) return null
    const selected = isLanguageSelected(language)
    return (
      <MenuItem
        ref={ref}
        key={language.code}
        active={active}
        disabled={disabled}
        icon={selected ? 'tick' : 'blank'}
        text={language.name}
        onClick={e => selected || handleClick(e)}
      />
    )
  }, [isLanguageSelected])

  const loadLanguages = React.useCallback(async () => {
    setLoading(true)
    try {
      const items = await Orchard.harvest('catalog/languages')
      setItems(items)
    } catch (error) {
      console.error('Failed to load languages:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadLanguages()
  }, [loadLanguages])

  // select 6 exposes the removed value directly via the top-level `onRemove` (the old
  // tagInputProps.onRemove passed the rendered node — deprecated).
  const handleRemove = React.useCallback((language) => {
    onChange(R.without([language], languages))
  }, [onChange, languages])

  const handleItemSelect = React.useCallback((language) => {
    if (isLanguageSelected(language)) return
    onChange([...languages, language])
  }, [onChange, languages, isLanguageSelected])

  return (
    <div className="bp6-dark">
      <MultiSelect
        resetOnSelect
        items={items}
        selectedItems={languages}
        itemsEqual="code"
        // Languages are all loaded up front, so filter client-side. Without a
        // predicate select 6 returns the full list unfiltered and typing does nothing.
        itemPredicate={(query, language) =>
          language.name.toLowerCase().includes(query.toLowerCase())
        }
        itemRenderer={renderMenuItem}
        noResults={
          <MenuItem
            disabled={true}
            text={intl.formatMessage({
              id: loading ? 'helpers.loading' : 'catalog.languages.noResults',
            })}
          />
        }
        tagRenderer={language => (
          <LanguageTag language={language}>{language.name}</LanguageTag>
        )}
        popoverProps={{
          className: 'language-chooser__popover',
          popoverClassName: 'bp6-popover bp6-multi-select-popover',
          minimal: true,
        }}
        //
        onItemSelect={handleItemSelect}
        onRemove={handleRemove}
        tagInputProps={{
          leftIcon: 'translate',
          inputProps: {
            placeholder: `${intl.formatMessage({ id: 'search.search' })}...`,
          },
        }}
      />
    </div>
  )
}

export default injectIntl(LanguageChooser)

const LanguageTag = styled.span`
  text-transform: capitalize;
`
