import React from 'react'

import EdgenotesCard from 'EdgenotesCard'
import CardContents from 'CardContents'

// class Card extends React.Component {
  // eventName() { return "read_card" }
  // trackableArgs() { return {
  //   case_slug: this.props.caseSlug,
  //   card_id: this.props.id,
  // } }
function Card ({id}) {
  return (
    <section>
      <CardContents id={id} />
      <EdgenotesCard
        cardId={id}
      />
    </section>
  )
}

export default Card
