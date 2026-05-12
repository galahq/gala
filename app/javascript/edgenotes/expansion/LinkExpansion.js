/**
 * Value object for the expansion of a link into an embed or a preview.
 *
 * @providesModule LinkExpansion
 * 
 */

import { Orchard } from 'shared/orchard'




class LinkExpansion {
  static async fetch (params) {
    const { slug, updatedAt, url } = params
    if (!url) return new NullLinkExpansion(url)

    return new LinkExpansion(
      await Orchard.harvest(`edgenotes/${slug}/link_expansion`, {
        href: url,
        updatedAt,
      })
    )
  }

  embed
  preview

  constructor ({ embed, preview }) {
    this.embed = embed
    this.preview = preview
  }

  get actsAsLink () {
    return !this.embed?.__html
  }

  get hasEmbed () {
    return !!this.embed?.__html
  }

  get linkDomain () {
    return domain(this.preview.url)
  }

  previewVisibility ({
    noDescription,
    noEmbed,
    noImage,
  }) {
    return new LinkExpansion({
      embed: noEmbed ? undefined : this.embed,
      preview: {
        ...this.preview,
        description: noDescription ? undefined : this.preview.description,
        images: noImage ? [] : this.preview.images,
      },
    })
  }
}

export default LinkExpansion

export class NullLinkExpansion {
  url

  constructor (url) {
    this.url = url
  }

  get actsAsLink () {
    return !!this.url
  }

  get hasEmbed () {
    return false
  }

  get linkDomain () {
    return domain(this.url)
  }

  previewVisibility (_) {
    return this
  }
}

function domain (url) {
  if (url == null) return ''
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch (e) {
    return ''
  }
}
