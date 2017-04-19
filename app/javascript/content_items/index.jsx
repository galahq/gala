// @flow

import React from 'react'
import { chooseContentItem } from 'shared/lti'

type ContentItem = {|
  kicker: string,
  title: string,
  dek: string,
  coverUrl: string,
  url: string,
|}

type ContentItemsProps = {|
  items: ContentItem[],
  returnUrl: string,
  returnData: string,
|}

const ContentItems = ({ items, returnUrl, returnData }: ContentItemsProps) => {
  const handleChooseContentItem = chooseContentItem.bind(
    undefined,
    returnUrl,
    returnData
  )
  return (
    <div className="catalog-cases">
      <div className="catalog-cases-index">
        {items.map((item: ContentItem, i: number) => (
          <ContentItemLink
            key={i}
            {...item}
            handleChooseContentItem={handleChooseContentItem}
          />
        ))}
      </div>
    </div>
  )
}

export default ContentItems

type ContentItemProps = ContentItem & {|
  handleChooseContentItem: (string) => void,
|}
const ContentItemLink = (
  {
    kicker,
    title,
    dek,
    coverUrl,
    url,
    handleChooseContentItem,
  }: ContentItemProps
) => {
  const handleClick = handleChooseContentItem.bind(undefined, url)
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
      <div className="catalog-case-credits">
        <h2>
          <span className="c-kicker">{kicker}</span>
          {title}
        </h2>
        <p style={{ display: 'none' }}>
          {dek}
        </p>
      </div>
    </a>
  )
}
