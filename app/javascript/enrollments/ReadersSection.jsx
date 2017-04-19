import React from 'react'

import { Filter } from 'enrollments/Filter'
import { Reader } from 'enrollments/Reader'
import { Group } from 'enrollments/Group'
import { SelectedReaders } from 'enrollments/SelectedReaders'

class ReadersList extends React.Component {
  selected (reader) {
    let { selectedReaders } = this.props
    return selectedReaders.indexOf(reader) !== -1
  }

  render () {
    return (
      <ul>
        {this.props.readers.map(reader => {
          return (
            <Reader
              key={reader.id}
              reader={reader}
              selected={this.selected(reader)}
              selectReader={this.props.selectReader}
            />
          )
        })}
      </ul>
    )
  }
}

function GroupsList ({ groups }) {
  return (
    <ul>
      {groups.map(group => {
        return <Group key={group.id} group={group} />
      })}
    </ul>
  )
}

class Tab extends React.Component {
  selected () {
    return this.props.selectedTab === this.props.name
  }

  render () {
    let tagName = this.selected() ? 'span' : 'a'
    let { name, changeTab } = this.props
    return React.createElement(
      tagName,
      {
        onClick: () => {
          changeTab(name)
        },
      },
      name
    )
  }
}

function SelectedReadersBucket ({ selectedReaders, handleClearSelection }) {
  if (selectedReaders.length > 0) {
    return (
      <div className="enrollments-section-readers-bucket">
        <h3>
          <span>Selected Readers</span>
          <a onClick={handleClearSelection}>Clear</a>
        </h3>
        <SelectedReaders selectedReaders={selectedReaders} />
      </div>
    )
  } else {
    return null
  }
}

export class ReadersSection extends React.Component {
  constructor () {
    super()
    this.state = {
      filterString: '',
      model: 'readers',
      selectedReaders: [],
    }

    this.filter = this.filter.bind(this)
    this.selectReader = this.selectReader.bind(this)
    this.changeTab = this.changeTab.bind(this)
    this.handleChangeFilter = this.handleChangeFilter.bind(this)
    this.clearSelectedReaders = this.clearSelectedReaders.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  changeTab (name) {
    this.setState({ model: name, filterString: '' })
  }

  handleChangeFilter (e) {
    this.setState({ filterString: e.target.value })
  }

  filter (reader) {
    return reader.name.match(RegExp(this.state.filterString, 'i')) !== null
  }

  selectReader (reader) {
    if (this.state.selectedReaders.indexOf(reader) === -1) {
      this.setState({
        selectedReaders: this.state.selectedReaders.concat([reader]),
      })
    } else {
      this.setState({
        selectedReaders: this.state.selectedReaders.remove(reader),
      })
    }
  }

  clearSelectedReaders () {
    this.setState({ selectedReaders: [] })
  }

  handleSubmit (e) {
    e.preventDefault()

    let { model } = this.state
    let readers = this.props.readers.filter(this.filter)
    if (model === 'readers' && readers.length === 1) {
      this.selectReader(readers[0])
      this.setState({ filterString: '' })
    }
  }

  renderList () {
    if (this.state.model === 'readers') {
      return (
        <ReadersList
          readers={this.props.readers.filter(this.filter)}
          selectedReaders={this.state.selectedReaders}
          selectReader={this.selectReader}
        />
      )
    } else {
      return <GroupsList groups={this.props.groups.filter(this.filter)} />
    }
  }

  render () {
    let { model, filterString } = this.state
    return (
      <section className="enrollments-section enrollments-section-readers">

        <h2>
          <Tab name="readers" selectedTab={model} changeTab={this.changeTab} />
          &nbsp;•&nbsp;
          <Tab name="groups" selectedTab={model} changeTab={this.changeTab} />
        </h2>

        <Filter
          filterString={filterString}
          model={model}
          onChange={this.handleChangeFilter}
          onSubmit={this.handleSubmit}
        />

        {this.renderList()}

        <SelectedReadersBucket
          selectedReaders={this.state.selectedReaders}
          handleClearSelection={this.clearSelectedReaders}
        />
      </section>
    )
  }
}
