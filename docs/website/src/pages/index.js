import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import home from './home.module.css'
import Feed from '../components/feed'
import Card from '../components/card'
import { Timeline } from 'react-twitter-widgets'

const features = [
  {
    title: 'Create and Innovate',
    imageUrl: 'img/create.svg',
    description: (
      <>
        The Gala learning environment makes it fast and easy for anyone to make
        or find an immersive sustainability case study or module that engages
        readers. Dynamically integrate content from around the web, including
        videos, podcasts, maps and data tools.
      </>
    ),
  },
  {
    title: 'Teach and share',
    imageUrl: 'img/share.svg',
    description: (
      <>
        Gala cases thrive in classroom, community, and remote learning settings.
        Create your own case to publish and share as widely as you like, or find
        one in our growing list of case libraries. Institutions with a series of
        cases can create their own libraries.
      </>
    ),
  },
  {
    title: 'Collaborate and adapt',
    imageUrl: 'img/community.svg',
    description: (
      <>
        Gala is built to encourage prototyping, review, and iterative
        improvement, allowing collaborators to develop pilot cases together and
        solicit feedback with inline comments before publishing and sharing with
        wider communities.
      </>
    ),
  },
]

const about = {
  description:
    'The Gala initiative seeks to make sustainability learning more grounded, dynamic, and collaborative. We built the Gala learning environment to make the best teaching cases on sustainability, emphasizing openness, experimentation, and collaboration across the world.',
  imageURL: '',
}

const examples = [
  {
    hed: 'Data Skills for Future Economies',
    dek: 'MBDH Learning Innovation Fellows',
    body:
      'Student fellows from across the midwest region’s colleges, vocational schools, and universities work with faculty to create innovative interactive data analysis activities that nest within sustainability science case studies. They design, prototype, and pilot these features in classrooms or professional learning communities within the Midwest Big Data Hub (MBDH) network, part of a four year, $4 million award from the National Science Foundation.',

    image: 'mbdh.png',
    moreLink:
      'https://midwestbigdatahub.org/mbdh-learning-innovation-fellows-program/',
    caseLink: '',
  },
  {
    hed: 'Enhancing Ecology Learning',
    dek:
      'Online Content for Experiential Learning of Tropical Systems (OCELOTS)',
    body:
      'OCELOTS is an international network of tropical ecologists, educators, media specialists, instructional designers and database engineers exploring best practices in research-based modules for teaching tropical biology and conservation. Funded by a National Science Foundation Grant (RCN-UBE proposal ID: 2120141), members of the network have integrated interactive data applications into cases to create online labs, used video and sound to capture place-based experiences, and pioneered collaborative online “networkshops” to exchange feedback on cases in progress.',
    image: 'ocelots.png',
    moreLink: '',
    caseLink: 'https://www.learngala.com/catalog/libraries/ocelots',
  },
  {
    hed: 'Grounded Engagement',
    dek: 'U-M SEAS Environmental Justice Education',
    body:
      "Cases in this library have been created in the University of Michigan's Environmental Justice Certificate and Masters Degree programs, by a combination of students, faculty and alumni and other professionals in advocacy, policy and research sectors. Each case addresses an environmental justice topic, from ableism in the environmentalist movement to indigenous rights and resource development.",
    image: 'ej.png',
    moreLink: '',
    caseLink:
      'https://www.learngala.com/catalog/libraries/um-seas-environmental-justice',
  },
  {
    hed: 'Adapting Case-Based Teaching for an Emerging Field',
    dek: 'Michigan Sustainability Cases',
    body:
      'Michigan Sustainability Cases center on real-world problems with multiple possible solutions. They are co-designed by teams of students and faculty from across the University of Michigan campus, in partnership with practitioners from various sectors. As the very first and one of the finest libraries on gala, they seek both to transform case based learning itself, and to widen participation in solving environment and sustainability challenges.',
    image: 'msc.png',
    moreLink:
      'https://crlt.umich.edu/michigan-sustainability-cases-initiative-adapting-case-based-teaching-innovative-sustainability',
    caseLink: 'https://www.learngala.com/catalog/libraries/michigan',
  },
  {
    hed: 'Sustainability and Development for Global Learners',
    dek: 'Sustainability and Development MasterTrack™ Certificate',
    body:
      'This collection focuses on the United Nations’ Sustainable Development goals, this online masters program has students analyze three Gala cases and synthesize their lessons for sustainability and development, before creating their own cases and developing an instructional component for the case of your choosing with a faculty member.',
    image: 'sdgs.png',
    moreLink:
      'https://online.umich.edu/series/sustainability-and-development-mastertrack-certificate/',
  },
  {
    hed:
      'Secondary Education for Sustainability: Curricular Environmental Partnerships',
    dek: 'The Dow Innovation Fellows Program at CEDER',
    body:
      'The Dow Innovation Teacher Fellowship (DITF), sponsored by the Dow Company Foundation, aims to provide educators with more support on their journey to become better stewards of the environment. DITF is implemented through the University of Michigan’s Center for Education Design, Evaluation, and Research (CEDER). DITF supports the education of teachers in the Saginaw-Midland-Bay City tricity area of Michigan on sustainability education methods, through professional development opportunities. The program integrates sustainability across school subjects, to support development of new Gala cases and adaptation of existing cases as interdisciplinary sustainability learning units in middle and high school classrooms using project and place-based pedagogical methods.',
    image: 'ditf.png',
    moreLink:
      'https://soe.umich.edu/news/secondary-teachers-invited-apply-dow-innovation-teacher-fellowship',
  },
]

function Features() {
  return (
    <div className="container">
      <div className="row">
        {features.map((props, idx) => (
          <Feature key={idx} {...props} />
        ))}
      </div>
    </div>
  )
}

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl)
  return (
    <div className={`col col--4 ${home.feature}`}>
      {imgUrl && (
        <div className="text--center">
          <img className={home.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function About() {
  return (
    <div className={`container ${home.aboutWrapper}`}>
      <div className="row">
        <div className="col col--4">
          <h3>About Gala</h3>
          <p>{about.description}</p>
          <ul>
            <li>
              <Link to={useBaseUrl('publications/')}>Publications</Link>
            </li>
          </ul>
        </div>
        <div className="col col--4">
          <h3>News & Updates</h3>
          <div className={home.newsWrapper}>
            <Feed />
          </div>
          <div className={home.moreButton}>
            <Link className="button button--link" to={useBaseUrl('blog/')}>
              More
            </Link>
          </div>
        </div>
        <div className="col col--4">
          <h3>Twitter</h3>
          <div className={home.twitterWrapper}>
            <Timeline
              dataSource={{
                sourceType: 'profile',
                screenName: 'learnmsc',
              }}
              options={{
                height: '400',
                chrome: 'noheader, nofooter',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Examples() {
  return (
    <div className="container">
      <h3>In Action</h3>
      <div className="row">
        <div className="col">
          <div className={[home.examplesGrid]}>
            {examples.map((example, index) => (
              <Card content={example} key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CallToAction() {
  return (
    <div className={home.callToActionContainer}>
      <img
        className={home.callToActionImage}
        src={require('@site/static/img/gala-background.png').default}
      />
      <div className={home.callToActionWrapper}>
        <div className={home.callToActionInnerContainer}>
          <h3>Ready to get started?</h3>
          <p>
            The best way to get to know Gala is to dive in and{' '}
            <a href="https://www.learngala.com/my_cases">create a pilot case</a>{' '}
            or <a href="https://www.learngala.com">browse some cases</a> in our
            libraries. You can also check out the{' '}
            <Link to={useBaseUrl('docs/')}>quick start guide</Link> for a basic
            how-to.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  return (
    <Layout
      title={`About ${siteConfig.title}`}
      description="The Gala Initiative: Open tools for sustainability learning"
    >
      <header className={`hero hero--primary ${home.heroBanner}`}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={home.heroButtonContainer}>
            <div className="button-group button-group--block">
              <a
                href="https://www.learngala.com"
                className={`button button--secondary ${home.primaryHeaderButton}`}
              >
                Go to Gala
              </a>

              <Link
                to={useBaseUrl('docs/')}
                className={`button ${home.secondaryHeaderButton}`}
              >
                Quick Start Guide
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className={[home.bodyWrapper]}>
          <section className={home.section}>
            <Features />
          </section>
          <section className={[home.section]}>
            <About />
          </section>
          <section className={[home.section]}>
            <Examples />
          </section>
          <section className={[home.section]}>
            <CallToAction />
          </section>
        </div>
      </main>
    </Layout>
  )
}
