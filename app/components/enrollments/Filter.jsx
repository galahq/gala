import React from 'react'

export function Filter () {
  let { model, filterString, onChange } = this.props
  return (
    <form onSubmit={this.props.onSubmit}>
      <label htmlFor={`filter-${model}`}>Filter {model}:</label>
      <input
        id={`filter-${model}`}
        type="text"
        value={filterString}
        autoComplete="off"
        onChange={onChange}
      />
    </form>
  )
}
