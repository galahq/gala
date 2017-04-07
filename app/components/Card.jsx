import React from 'react'

import EdgenotesCard from 'EdgenotesCard'
import CardContents from 'CardContents'

const Card = ({ id }: { id: string }) => (
  <section>
    <CardContents id={id} />
    <EdgenotesCard
      cardId={id}
    />
  </section>
)

export default Card
