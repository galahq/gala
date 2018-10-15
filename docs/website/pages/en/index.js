/* @flow */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')
const MarkdownBlock = CompLibrary.MarkdownBlock /* Used to read markdown */
const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

const siteConfig = require(process.cwd() + '/siteConfig.js')

function imgUrl (img) {
  return siteConfig.baseUrl + 'img/' + img
}

function docUrl (doc, language) {
  return siteConfig.baseUrl + 'docs/' + (language ? language + '/' : '') + doc
}

function pageUrl (page, language) {
  return siteConfig.baseUrl + (language ? language + '/' : '') + page
}

class Button extends React.Component {
  render () {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    )
  }
}

Button.defaultProps = {
  target: '_self',
}

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
)

const Logo = props => (
  <div className="projectLogo">
    <img src={props.img_src} />
  </div>
)

const ProjectTitle = props => (
  <h2 className="projectTitle">
    {siteConfig.title}
    <small>{siteConfig.tagline}</small>
  </h2>
)

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
)

class HomeSplash extends React.Component {
  render () {
    let language = this.props.language || ''
    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle />
          <p style={{ color: 'white' }}>Start with the guide for:</p>
          <PromoSection>
            <Button href={docUrl('authoring-getting-started.html', language)}>
              Authoring a Case
            </Button>
            <Button href={docUrl('teaching-getting-started.html', language)}>
              Teaching a Case
            </Button>
          </PromoSection>
        </div>
      </SplashContainer>
    )
  }
}

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}
  >
    <GridBlock
      align={props.centered && 'center'}
      contents={props.children}
      layout={props.layout}
    />
  </Container>
)

const Features = props => (
  <Block centered layout="fourColumn">
    {[
      {
        title: 'Impactful Cases',
        content: `Find a case about contemporary sustainability issues to study
          or to teach as they are unfolding. It’s now easy to find engaging
          teaching materials for use in classrooms and for public education.`,
        image: imgUrl('impact-icon.png'),
        imageAlign: 'top',
      },
      {
        title: 'Innovative Teaching',
        content: `Improve your ability to communicate complex topics by adding
          your own case study to Gala. Your media-rich cases and Gala’s
          immersive user interface will delight instructors and learners.`,
        image: imgUrl('innovation-icon.png'),
        imageAlign: 'top',
      },
      {
        title: 'Inclusive Community',
        content: `Join conversations that consider a wide range of perspectives.
          Share your own on our embedded forums, hear from others on our
          podcasts, and create your own unconventional solutions.`,
        image: imgUrl('inclusion-icon.png'),
        imageAlign: 'top',
      },
    ]}
  </Block>
)

const Description = props => (
  <div className="whatIsGala">
    <Block background="light">
      {[
        {
          title: 'What is Gala?',
          image: imgUrl('malia-and-danielle.png'),
          content: `We built Gala to make the best teaching cases on
          sustainability, and to enable collaboration across the world. Anyone
          can create, publish, and continually update a case about any topic
          they want. We named it for an apple variety commonly grown in
          Michigan. But the name also evokes a party where people come together
          to combine their resources for innovative work in the world. Because
          making cleaner, safer, more efficient and resilient systems for water,
          food, waste, energy, transport, recreation, and more is worth
          celebrating—and worth supporting. And so we invite you to join us in
          learning and teaching, and to be the hands that build bridges.`,
          imageAlign: 'right',
        },
      ]}
    </Block>
  </div>
)

class Index extends React.Component {
  render () {
    let language = this.props.language || ''

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Features />
          <Description />
        </div>
      </div>
    )
  }
}

module.exports = Index
