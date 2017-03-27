import React from 'react'
import { connect } from 'react-redux'

import { EditableText } from '@blueprintjs/core'

import { updateCase } from 'redux/actions.js'

function mapStateToProps(state) {
  let { edit, caseData } = state
  let {
    slug, kicker, title, photoCredit, caseAuthors, translators, coverUrl,
  } = caseData

  return {
    slug, kicker, title, photoCredit, caseAuthors, translators, coverUrl,
    editing: edit.inProgress,
  }
}

const BillboardTitle = ({ editing, slug, kicker, title, photoCredit, caseAuthors,
                          translators, coverUrl, updateCase, minimal,
}) => {

  let background = { backgroundImage: `
      linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.5)),
      url(${coverUrl})
    `,
  }

  return <div className="BillboardTitle" style={background}>
    <h6>
      <EditableText value={kicker} disabled={!editing || minimal}
        placeholder="Snappy kicker"
        onChange={value => updateCase(slug, {kicker: value})}
      />
    </h6>

    <h1>
      <EditableText multiline value={title} disabled={!editing || minimal}
        placeholder="What is the central question of the case?"
        onChange={value => updateCase(slug, {title: value})}
      />
    </h1>

    { !minimal && caseAuthors !== "" &&
      <h4>
        { caseAuthors }
        <br />
        { translators !== "" && <em>{ translators }</em> }
      </h4>
      }

      <cite className="o-bottom-right c-photo-credit">
        {minimal || <EditableText value={photoCredit} disabled={!editing}
          placeholder={ !!editing && "Photo credit" }
          onChange={value => updateCase(slug, {photoCredit: value})}
        />}
      </cite>
    </div>
}


export default connect(
  mapStateToProps,
  { updateCase },
)(BillboardTitle)
