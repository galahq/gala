import React from 'react'
import { EditableText } from '@blueprintjs/core'

const EditableAttribute = ({disabled, title, value, onChange}) =>
  disabled ? null : <div style={style.container}>
    { value && value.length > 0 && <label style={style.label}>{title}</label> }
    <EditableText
      placeholder={`Add ${title}...`}
      value={value}
      onChange={onChange}
    />
  </div>

export default EditableAttribute


const style = {
  container: {
    marginTop: '0.25em',
    marginBottom: '0.5em',
  },
  label: {
    display: 'block',
    opacity: 0.7,
  },
}
