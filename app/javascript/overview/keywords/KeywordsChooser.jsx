/**
 * MultiSelect dropdown to present keyword suggestions.
 *
 * @providesModule KeywordsChooser
 * @flow
 */

import * as React from 'react'
import * as R from 'ramda'
import debounce from 'lodash.debounce'
import styled from 'styled-components'
import { injectIntl } from 'react-intl'
import { MenuItem } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'
import { Orchard } from 'shared/orchard'

import type { IntlShape } from 'react-intl'
import type { Tag } from 'redux/state'
import type TaggingsManager from './TaggingsManager'

type Props = {
  intl: IntlShape,
  fullWidth?: boolean,
  onChange: (Tag[]) => mixed,
  taggingsManager?: TaggingsManager,
  tags: Tag[],
}
type State = { items: Tag[], query: string }
class KeywordsChooser extends React.Component<Props, State> {
  state = { items: [], query: '' }

  isTagSelected = tag => this.props.tags.map(t => t.name).includes(tag.name)

  renderMenuItem = (
    tag,
    { handleClick, modifiers: { active, disabled, matchesPredicate }}
  ) => {
    if (!matchesPredicate) return null
    const selected = this.isTagSelected(tag)
    return (
      <Capitalized>
        <MenuItem
          active={active}
          disabled={disabled}
          icon={selected ? 'tick' : 'blank'}
          text={tag.displayName}
          onClick={e => selected || handleClick(e)}
        />
      </Capitalized>
    )
  }

  render () {
    const { intl, onChange, taggingsManager, tags } = this.props
    return (
      <div className="bp3-dark">
        <MultiSelect
          resetOnSelect
          //
          items={this.state.items}
          selectedItems={tags}
          //
          itemRenderer={this.renderMenuItem}
          noResults={
            <MenuItem
              disabled={true}
              text={intl.formatMessage({
                id:
                  this.state.query.length > 0
                    ? 'tags.new.pressEnter'
                    : 'helpers.loading',
              })}
            />
          }
          tagRenderer={tag => (
            <Capitalized tag={tag}>{tag.displayName}</Capitalized>
          )}
          popoverProps={{
            className: 'keywords-chooser__popover',
            minimal: true,
          }}
          //
          tagInputProps={{
            leftIcon: 'tag',
            inputProps: { onFocus: this._loadKeywords },
            onAdd: values => {
              if (this.state.items.length > 0) return
              this.setState({ query: '' }, () => {
                values.forEach(v => taggingsManager && taggingsManager.add(v))
                onChange([
                  ...tags,
                  ...values.map(name => ({ name, displayName: name })),
                ])
              })
              return true
            },
            onInputChange: ({ target: { value }}) =>
              this.setState({ query: value }, this.loadKeywords),
            onRemove: ({ props: { tag }}) => {
              taggingsManager && taggingsManager.remove(tag.name)
              onChange(R.without([tag], tags))
            },
          }}
          onItemSelect={tag =>
            this.setState({ query: '' }, () => {
              taggingsManager && taggingsManager.add(tag.name)
              onChange([...tags, tag])
              this._loadKeywords()
            })
          }
        />
      </div>
    )
  }

  _loadKeywords = () => {
    Orchard.harvest(`tags`, { q: this.state.query }).then(items =>
      this.setState({ items })
    )
  }
  loadKeywords = debounce(this._loadKeywords, 200)
}

export default injectIntl(KeywordsChooser)

const Capitalized = styled.span`
  text-transform: capitalize;
`
