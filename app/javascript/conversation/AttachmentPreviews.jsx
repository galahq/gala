/**
 * Masonry display for thumbnails of image attachments
 *
 * @providesModule AttachmentPreviews
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { useElementSize } from 'utility/hooks'

const GAP_WIDTH = 10

type Props = {
  attachments: Array<{
    name: string,
    representable: true,
    size: { height: number, width: number },
    url: string,
  }>,
}

function AttachmentPreviews ({ attachments }: Props) {
  const [{ width: containerWidth }, containerRef] = useElementSize()

  const numColumns = attachments.length > 2 ? 2 : 1

  const gapsWidth = (numColumns - 1) * GAP_WIDTH
  const columnWidth = (containerWidth - gapsWidth) / numColumns

  let columnHeights = new Array(numColumns).fill(0)
  const items = attachments.map((attachment, i) => {
    const scaleRatio = columnWidth / attachment.size.width
    const height = attachment.size.height * scaleRatio

    const shortestColumn = columnHeights.lastIndexOf(Math.min(...columnHeights))
    const x = shortestColumn * (columnWidth + GAP_WIDTH)
    const y = columnHeights[shortestColumn]

    columnHeights[shortestColumn] += height + GAP_WIDTH

    return { attachment, x, y, height, width: columnWidth }
  })

  if (attachments.length === 0) return null

  return (
    <Container
      ref={containerRef}
      columnHeights={columnHeights}
      columnWidth={columnWidth + GAP_WIDTH}
      height={Math.max(...columnHeights)}
    >
      {items.map(({ attachment: { url }, ...positionProps }) => (
        <a key={url} href={url}>
          <Image alt="" src={url} {...positionProps} />
        </a>
      ))}
    </Container>
  )
}

export default AttachmentPreviews

const Container = styled.figure`
  float: right;
  height: ${p => p.height}px;
  margin: 0 0 ${GAP_WIDTH}px ${GAP_WIDTH}px;
  position: relative;
  width: 50%;

  ${({ columnHeights, columnWidth }) => {
    let points = []

    columnHeights.forEach((height, i) => {
      points.push(`${columnWidth * i}px ${height}px`)
      points.push(`${columnWidth * (i + 1)}px ${height}px`)
    })

    return css`
      shape-outside: polygon(0 0, ${points.join(', ')}, 100% 0);
    `
  }};
`

const Image = styled.img`
  height: ${p => p.height}px;
  position: absolute;
  transform: translate3d(${p => p.x}px, ${p => p.y}px, 0);
  width: ${p => p.width}px;
`
