import React from 'react'
import { EditableText } from '@blueprintjs/core'

const EditableAttribute = ({disabled, title, value, onChange, style={}}) =>
  disabled ? null : <div style={{...styles.container, ...style}}>
    { value && value.length > 0 && <label style={styles.label}>{title}</label> }
    <EditableText
      placeholder={`Add ${title}...`}
      value={value}
      onChange={onChange}
    />
  </div>

export default EditableAttribute


const styles = {
  container: {
    marginTop: '0.25em',
    marginBottom: '0.5em',
  },
  label: {
    display: 'block',
    opacity: 0.7,
  },
}
