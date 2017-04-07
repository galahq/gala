import React from 'react'

import EdgenotesCard from 'edgenotes/EdgenotesCard'
import CardContents from 'cards/CardContents'

const Card = ({ id }: { id: string }) => (
  <section>
    <CardContents id={id} />
    <EdgenotesCard
      cardId={id}
    />
  </section>
)

export default Card
