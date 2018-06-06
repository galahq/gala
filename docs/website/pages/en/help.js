/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')
const Container = CompLibrary.Container
const MarkdownBlock = CompLibrary.MarkdownBlock

function Help (props) {
  return (
    <div className="docMainWrapper wrapper">
      <Container className="mainContainer documentContainer postContainer">
        <div className="post">
          <header className="postHeader">
            <h2>Need help?</h2>
          </header>
          <MarkdownBlock>
            Gala is developed and maintained by a very small team in the
            University of Michigan’s School of Environment and Sustainability.
            We hope this website will have the answers to your questions. If
            not, please email us at hello@learngala.com. We’ll be happy to hear
            from you and we’ll do our best to help.
          </MarkdownBlock>
        </div>
      </Container>
    </div>
  )
}

module.exports = Help
