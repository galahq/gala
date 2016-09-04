import React from 'react'

export class Filter extends React.Component {
  render() {
    let {model, filterString, onChange, autoFocus} = this.props
    return (
      <form onSubmit={this.props.onSubmit}>
        <label htmlFor={`filter-${model}`}>Filter {model}:</label>
        <input
          id={`filter-${model}`}
          type="text"
          value={filterString}
          onChange={onChange}
          autoComplete="off"
          autoFocus={autoFocus}
        />
      </form>
    )
  }

}
