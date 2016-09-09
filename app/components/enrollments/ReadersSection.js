import React from 'react'

import {Filter} from 'enrollments/Filter'
import {Reader} from 'enrollments/Reader'
import {SelectedReaders} from 'enrollments/SelectedReaders'

class ReadersList extends React.Component {
  selected(reader) {
    let {model, selectedReaders} = this.props
    return model === "readers" && selectedReaders.indexOf(reader) !== -1
  }

  render() {
    return <ul>
      {this.props.readers.map((reader) => {
        return <Reader key={reader.id} reader={reader} selected={this.selected(reader)} selectReader={this.props.selectReader} />
      })}
    </ul>
  }
}

class Tab extends React.Component {
  selected() {
    return this.props.selectedTab === this.props.name
  }

  render() {
    let tagName = this.selected() ? "span" : "a"
    let {name, changeTab} = this.props
    return (
      React.createElement(tagName, {onClick: () => { changeTab(name) }}, name)
    )
  }
}

class SelectedReadersBucket extends React.Component {
  render() {
    let {selectedReaders} = this.props
    if (selectedReaders.length > 0) {
      return <div className="enrollments-section-readers-bucket">
        <h3>
          <span>Selected Readers</span>
          <a onClick={this.props.clearSelection}>Clear</a>
        </h3>
        <SelectedReaders selectedReaders={selectedReaders} />
      </div>
    } else {
      return null
    }
  }
}

export class ReadersSection extends React.Component {

  constructor() {
    super()
    this.state = {
      filterString: "",
      model: "readers",
      selectedReaders: []
    }
  }

  changeTab(name) {
    this.setState({model: name, filterString: ""})
  }

  changeFilter(e) {
    this.setState({filterString: e.target.value})
  }

  filter(reader) {
    return reader.name.match(RegExp(this.state.filterString, 'i')) !== null
  }

  selectReader(reader) {
    if (this.state.selectedReaders.indexOf(reader) === -1) {
      this.setState({
        selectedReaders: this.state.selectedReaders.concat([reader])
      })
    } else
      this.setState({
        selectedReaders: this.state.selectedReaders.remove(reader)
      })
  }

  clearSelectedReaders() {
    this.setState({selectedReaders: []})
  }

  onSubmit(e) {
    e.preventDefault()

    let {model} = this.state
    let readers = this.props.readers.filter(this.filter.bind(this))
    if (model === "readers" && readers.length === 1) {
      this.selectReader(readers[0])
      this.setState({filterString: ""})
    }
  }

  render() {
    let {model, filterString, selectedReaders} = this.state
    return (
      <section className="enrollments-section enrollments-section-readers">

        <h2>
          <Tab name="readers" selectedTab={model} changeTab={this.changeTab.bind(this)} />
          &nbsp;•&nbsp;
          <Tab name="groups" selectedTab={model} changeTab={this.changeTab.bind(this)} />
        </h2>

        <Filter
          filterString={filterString}
          model={model}
          onChange={this.changeFilter.bind(this)}
          selectReader={this.selectReader.bind(this)}
          onSubmit={this.onSubmit.bind(this)}
          autoFocus={true}
        />

        <ReadersList
          model={model}
          readers={this.props[model].filter(this.filter.bind(this))}
          selectedReaders={selectedReaders}
          selectReader={this.selectReader.bind(this)}
        />

        <SelectedReadersBucket
          selectedReaders={this.state.selectedReaders}
          clearSelection={this.clearSelectedReaders.bind(this)}
        />
      </section>
    )

  }

}
