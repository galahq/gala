/**
 * MultiSelect dropdown to present language suggestions.
 *
 * @providesModule LanguageChooser
 * @flow
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
    { handleClick, modifiers: { active, disabled, matchesPredicate }}
  ) => {
    if (!matchesPredicate) return null
    const selected = isLanguageSelected(language)
    return (
      <MenuItem
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

  const handleRemove = React.useCallback(({ props: { language }}) => {
    onChange(R.without([language], languages))
  }, [onChange, languages])

  const handleItemSelect = React.useCallback((language) => {
    onChange([...languages, language])
  }, [onChange, languages])

  return (
    <div className="pt-dark">
      <MultiSelect
        items={items}
        selectedItems={languages}
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
          minimal: true,
        }}
        //
        tagInputProps={{
          leftIcon: 'translate',
          onRemove: handleRemove,
        }}
        onItemSelect={handleItemSelect}
      />
    </div>
  )
}

export default injectIntl(LanguageChooser)

const LanguageTag = styled.span`
  text-transform: capitalize;
`
