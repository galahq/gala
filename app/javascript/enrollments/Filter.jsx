import React from 'react'

export function Filter ({ model, filterString, onSubmit, onChange }) {
  return (
    <form onSubmit={onSubmit}>
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
