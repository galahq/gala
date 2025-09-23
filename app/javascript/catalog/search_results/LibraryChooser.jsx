/**
 * MultiSelect dropdown to present library suggestions.
 *
 * @providesModule LibraryChooser
 * @flow
 */

import * as React from 'react'
import * as R from 'ramda'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'
import { MenuItem } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'

import { CatalogDataContext } from 'catalog/catalogData'

function LibraryChooser({ intl, onChange, libraries }) {
  const [{ libraries: availableLibraries }] = React.useContext(CatalogDataContext)

  const isLibrarySelected = React.useCallback((library) => 
    libraries.map(l => l.slug).includes(library.slug), [libraries]
  )

  const renderMenuItem = React.useCallback((
    library,
    { handleClick, modifiers: { active, disabled, matchesPredicate }}
  ) => {
    if (!matchesPredicate) return null
    const selected = isLibrarySelected(library)
    return (
      <MenuItem
        key={library.slug}
        active={active}
        disabled={disabled}
        icon={selected ? 'tick' : 'blank'}
        text={library.name}
        onClick={e => selected || handleClick(e)}
      />
    )
  }, [isLibrarySelected])

  const handleRemove = React.useCallback(({ props: { library }}) => {
    onChange(R.without([library], libraries))
  }, [onChange, libraries])

  const handleItemSelect = React.useCallback((library) => {
    onChange([...libraries, library])
  }, [onChange, libraries])

  return (
    <div className="pt-dark">
      <MultiSelect
        resetOnSelect
        items={availableLibraries}
        selectedItems={libraries}
        itemRenderer={renderMenuItem}
        noResults={
          <MenuItem
            disabled={true}
            text={intl.formatMessage({
              id: 'catalog.libraries.noResults',
            })}
          />
        }
        tagRenderer={library => (
          <LibraryTag library={library}>{library.name}</LibraryTag>
        )}
        popoverProps={{
          className: 'library-chooser__popover',
          minimal: true,
        }}
        tagInputProps={{
          leftIcon: 'library',
          onRemove: handleRemove,
        }}
        onItemSelect={handleItemSelect}
      />
    </div>
  )
}

export default injectIntl(LibraryChooser)

const LibraryTag = styled.span`
  max-width: 220px;
  word-wrap: break-word;
  word-break: break-word;
  display: inline-block;
`
