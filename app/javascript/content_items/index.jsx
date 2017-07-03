/**
 * @providesModule ContentItems
 * @flow
 */

import React from 'react'
import { submitForm } from 'shared/lti'

type ContentItem = {
  slug: string,
  kicker: string,
  title: string,
  dek: string,
  coverUrl: string,
  published: boolean,
}

type ContentItemsProps = {
  items: ContentItem[],
  groupId: string,
}

function createDeployment (groupId: string, caseSlug: string) {
  submitForm(`/groups/${groupId}/deployments`, {
    case_slug: caseSlug,
  })
}

const ContentItems = ({ items, groupId }: ContentItemsProps) => {
  const handleSelectContentItem = createDeployment.bind(undefined, groupId)
  return (
    <div className="catalog-cases">
      <div className="catalog-cases-index">
        {items.map((item: ContentItem, i: number) =>
          <ContentItemLink
            key={i}
            {...item}
            handleSelectContentItem={handleSelectContentItem}
          />
        )}
      </div>
    </div>
  )
}

export default ContentItems

type ContentItemProps = ContentItem & {
  handleSelectContentItem: string => void,
}

const ContentItemLink = ({
  slug,
  kicker,
  title,
  dek,
  coverUrl,
  published,
  handleSelectContentItem,
}: ContentItemProps) => {
  const handleClick = handleSelectContentItem.bind(undefined, slug)
  return (
    <a
      tabIndex="0"
      className="BillboardTitle catalog-case catalog-content-item"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.5)),
          url(${coverUrl})`,
      }}
      onClick={handleClick}
    >
      {published ||
        <div className="catalog-case-unpublished-banner">Forthcoming</div>}
      <div className="catalog-case-credits">
        <h2>
          <span className="c-kicker">
            {kicker}
          </span>
          {title}
        </h2>
        <p style={{ display: 'none' }}>
          {dek}
        </p>
      </div>
    </a>
  )
}
