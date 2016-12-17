import {
  ContentState,
  convertFromHTML,
  convertToRaw
} from 'draft-js'

const UrlPrefix = "http://learnmsc.org///"
const EdgenotePrefix = UrlPrefix + 'edgenote/'
const CitationPrefix = UrlPrefix + 'citation'

function convertFromOldStyleCardSerialization(content) {
  /* String -> DraftRawContentState
   *
   * If there is no RawDraftContentState persisted, we need to try to
   * convert from the old way of serializing edgenotes and citations in HTML
   * as anchors and cite tags.
   * Since draft.js only preserves %i(href rel target title) from links,
   * we're going to have to use code.
   *
   * Edgenote:
   * <a href=`${EdgenotePrefix}/:slug`>highlighted text</a>
   *
   * Citation:
   * <a title=":citeInnerText" target=":citeAnchorHref" href=`${CitationPrefix}`></a>
   */

  let transformedContent = reencodeEdgenotes( reencodeCitations( content ) )

  let blocksFromHTML = convertFromHTML(transformedContent)
  var convertedRawContent = convertToRaw(ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  ))

  Object.keys(convertedRawContent.entityMap).forEach((key) => {
    let entity = convertedRawContent.entityMap[`${key}`]
    let {url, title, target} = entity.data

    if ( url.startsWith(EdgenotePrefix) ) {
      convertedRawContent.entityMap[`${key}`] = {
        type: "EDGENOTE",
        mutability: "MUTABLE",
        data: { slug: url.match(RegExp(EdgenotePrefix + '(.+)'))[1] }
      }
    } else if ( url.startsWith(CitationPrefix) ) {
      convertedRawContent.entityMap[`${key}`] = {
        type: "CITATION",
        mutability: 'IMMUTABLE',
        data: { href: target, contents: title }
      }
    }

  })

  return convertedRawContent
}
export default convertFromOldStyleCardSerialization

function reencodeEdgenotes(content) {
  return content.replace(
    /data-edgenote="/g,
    `href="${EdgenotePrefix}`
  )
}

function reencodeCitations(content) {
  return content.replace(
    /<cite>(.*?href="(.*?)".*?>(.*?)<\/a>.*?|([^<]*?))<\/cite>/g,
    `<a title="$3$4" target="$2" href="${CitationPrefix}">◦</a>`
  )
}
