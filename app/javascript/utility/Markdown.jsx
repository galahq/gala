/**
 * Wraps ReactMarkdown to standardize our renderer needs.
 *
 * @providesModule Markdown
 * @flow
 */

import React from 'react'
import ReactMarkdown from 'react-markdown'

export const LinkWithTargetBlank = ({ children, ...rest }: any) => (
  <a {...rest} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
)

const Markdown = ({ source }: { source: string }) => (
  <ReactMarkdown source={source} renderers={{ link: LinkWithTargetBlank }} />
)

export default Markdown
