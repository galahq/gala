/**
 * MultiSelect dropdown to present keyword suggestions.
 *
 * @providesModule KeywordsChooser
 * 
 */

import * as React from 'react'
import * as R from 'ramda'
import debounce from 'lodash.debounce'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'
import { MenuItem } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'
import { Orchard } from 'shared/orchard'


class KeywordsChooser extends React.Component {
  state = { items: [], query: '', loading: false }

  isTagSelected = tag => this.props.tags.map(t => t.name).includes(tag.name)

  // @blueprintjs/select 6 drives the query and the add/remove flow through the
  // MultiSelect's own props — it overrides `tagInputProps.onInputChange` and
  // `tagInputProps.onAdd` internally, so those no longer fire. The query is now
  // controlled via `query`/`onQueryChange`, and free-text keywords are created via
  // `createNewItemFromQuery`/`createNewItemRenderer` (selecting the "create" item
  // dispatches `onItemSelect` with the new tag).
  handleItemSelect = tag => {
    if (this.isTagSelected(tag)) return
    const { onChange, taggingsManager, tags } = this.props
    this.setState({ query: '' }, () => {
      taggingsManager && taggingsManager.add(tag.name)
      onChange([...tags, tag])
      this._loadKeywords()
    })
  }

  handleRemove = tag => {
    const { onChange, taggingsManager, tags } = this.props
    taggingsManager && taggingsManager.remove(tag.name)
    onChange(R.without([tag], tags))
  }

  renderMenuItem = (
    tag,
    { handleClick, modifiers: { active, disabled, matchesPredicate }, ref }
  ) => {
    if (!matchesPredicate) return null
    const selected = this.isTagSelected(tag)
    return (
      <Capitalized>
        <MenuItem
          ref={ref}
          active={active}
          disabled={disabled}
          icon={selected ? 'tick' : 'blank'}
          text={tag.displayName}
          onClick={e => selected || handleClick(e)}
        />
      </Capitalized>
    )
  }

  // Match prod: rather than a highlighted "Create new keyword: X" row, show prod's
  // plain "No results. Press Enter to create a new keyword." hint. @blueprintjs/select 6
  // suppresses TagInput's native Enter-to-add (getTagInputAddHandler only handles
  // paste), so creation on Enter has to route through this createNewItem row — but we
  // render it with prod's wording and no active highlight so it reads the same.
  renderCreateItem = (query, active, handleClick) => (
    <MenuItem
      shouldDismissPopover={false}
      text={this.props.intl.formatMessage({ id: 'tags.new.pressEnter' })}
      onClick={handleClick}
    />
  )

  render () {
    const { intl, tags } = this.props
    return (
      <DarkChooser>
        <MultiSelect
          resetOnSelect
          //
          items={this.state.items}
          selectedItems={tags}
          itemsEqual="name"
          query={this.state.query}
          onQueryChange={query => this.setState({ query }, this.loadKeywords)}
          //
          itemRenderer={this.renderMenuItem}
          // Prod only offered "press Enter to create" when there were no matching
          // suggestions; when suggestions exist you pick one. Gate the create option
          // on an empty result set to mirror that.
          createNewItemFromQuery={
            this.state.items.length === 0
              ? name => ({ name, displayName: name })
              : undefined
          }
          createNewItemRenderer={this.renderCreateItem}
          noResults={
            <MenuItem
              disabled={true}
              text={intl.formatMessage({
                id: this.state.loading
                  ? 'helpers.loading'
                  : 'tags.new.pressEnter',
              })}
            />
          }
          tagRenderer={tag => (
            <Capitalized tag={tag}>{tag.displayName}</Capitalized>
          )}
          popoverProps={{
            className: 'keywords-chooser__popover',
            popoverClassName: 'bp6-popover bp6-multi-select-popover',
            minimal: true,
          }}
          //
          onItemSelect={this.handleItemSelect}
          onRemove={this.handleRemove}
          tagInputProps={{
            leftIcon: 'tag',
            // BP6's TagInput hides the `placeholder` prop once there are tags (old
            // select showed it regardless), so prod's persistent "Search…" disappeared.
            // inputProps.placeholder always renders — restore it there.
            inputProps: {
              onFocus: this._loadKeywords,
              placeholder: `${intl.formatMessage({ id: 'search.search' })}...`,
            },
          }}
        />
      </DarkChooser>
    )
  }

  _loadKeywords = () => {
    this.setState({ loading: true })
    Orchard.harvest(`tags`, { q: this.state.query })
      .then(items => this.setState({ items, loading: false }))
      .catch(() => this.setState({ loading: false }))
  }
  loadKeywords = debounce(this._loadKeywords, 200)
}

export default injectIntl(KeywordsChooser)

const Capitalized = styled.span`
  text-transform: capitalize;
`

// The chooser sits in a dark (bp6-dark) bar. BP6's dark TagInput chip defaults to a
// dark slate fill + white text, which reads as white-on-transparent against the navy;
// prod (BP2) renders these keyword chips light gray with dark text (and a dark remove
// X). Scope the override here so other bp6-tags in the app are unaffected. `&&` beats
// BP6's `.bp6-dark .bp6-tag` (equal-specificity) selector.
const DarkChooser = styled.div.attrs({ className: 'bp6-dark' })`
  && .bp6-tag {
    background-color: rgb(196, 200, 202);
    color: rgb(1, 24, 45);
  }

  && .bp6-tag .bp6-tag-remove {
    color: rgb(1, 24, 45);
    /* Prod's X is dark navy at 0.5 opacity (reads gray), brightening to 0.8 on hover —
       NOT solid black. */
    opacity: 0.5;
  }

  && .bp6-tag .bp6-tag-remove:hover {
    opacity: 0.8;
  }
`
