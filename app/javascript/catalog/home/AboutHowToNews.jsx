/**
 * @providesModule AboutHowToNews
 * @flow
 */

import React from 'react'
import styled from 'styled-components'

import { CatalogSection, SectionTitle } from 'catalog/shared'

const RSS_URL = 'https://docs.learngala.com/blog/rss.xml'
const MAX_NEWS_ITEMS = 5
const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/VIDEO_ID'
const HOW_TO_ICON_CLASS_BY_TYPE = {
  guide: 'pt-icon-manual',
  video: 'pt-icon-video',
}

function HowToListItem({ href, iconType = 'guide', children }) {
  const iconClass = HOW_TO_ICON_CLASS_BY_TYPE[iconType] || HOW_TO_ICON_CLASS_BY_TYPE.guide

  return (
    <li>
      <HowToLink href={href}>
        <HowToIcon className={`pt-icon ${iconClass}`} aria-hidden />
        {children}
      </HowToLink>
    </li>
  )
}

function AboutHowToNews() {
  const [newsItems, setNewsItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true

    async function loadRss() {
      try {
        const response = await fetch(RSS_URL)
        if (!response.ok) throw new Error('Failed to load RSS')

        const xml = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(xml, 'text/xml')
        const items = Array.from(doc.querySelectorAll('item'))
          .slice(0, MAX_NEWS_ITEMS)
          .map(item => ({
            title: ((item.querySelector('title') && item.querySelector('title').textContent) || '').trim(),
            link: ((item.querySelector('link') && item.querySelector('link').textContent) || '').trim(),
          }))
          .filter(item => item.title && item.link)

        if (!isMounted) return
        setNewsItems(items)
      } catch (e) {
        if (!isMounted) return
        setError(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadRss()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Columns>
      <StyledCatalogSection solid>
        <SectionTitle>About Gala</SectionTitle>
        <BodyText>
          Gala is working to make learning more grounded, dynamic, and collaborative. We maintain the Gala platform for open educational modules and case students and work with teams innovating around module creation and use.
        </BodyText>
        <AboutList>
          <li>
            <AboutLink href="https://docs.learngala.com/team">Team</AboutLink>
          </li>
          <li>
            <AboutLink href="https://docs.learngala.com/publications">Publications</AboutLink>
          </li>
          <li>
            <AboutLink href="https://docs.learngala.com/projects">Projects & Partners</AboutLink>
          </li>
        </AboutList>
        <SocialLinks>
          <SocialLink
            href="https://www.linkedin.com/company/learngala"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Gala on LinkedIn"
            title="LinkedIn"
          >
            <SocialIcon
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z" />
            </SocialIcon>
          </SocialLink>
          <SocialLink
            href="https://bsky.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Gala on Bluesky"
            title="Bluesky"
          >
            <SocialIcon
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 600 530"
              aria-hidden
            >
              <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" />
            </SocialIcon>
          </SocialLink>
          <SocialLink
            href="https://github.com/galahq/gala"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Gala on GitHub"
            title="GitHub"
          >
            <SocialIcon
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
            </SocialIcon>
          </SocialLink>
        </SocialLinks>
      </StyledCatalogSection>

      <StyledCatalogSection solid>
        <SectionTitle>How-to</SectionTitle>
        <VideoFrame
          title="How-to video"
          src={YOUTUBE_EMBED_URL}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <LinkList>
          <HowToListItem href="https://docs.learngala.com/docs/" iconType="guide">
            Quick Start Authoring Guide
          </HowToListItem>
          <HowToListItem href="https://docs.learngala.com/docs/teaching-strategies" iconType="guide">
            Teaching Strategies
          </HowToListItem>
          <HowToListItem href="https://docs.learngala.com/docs/advanced-planning-your-case" iconType="guide">
            Planning a Case
          </HowToListItem>
          <HowToListItem href="https://docs.learngala.com/docs/general-licensing" iconType="guide">
            Module Licensing
          </HowToListItem>
        </LinkList>

      </StyledCatalogSection>

      <StyledCatalogSection solid>
        <SectionTitle>News & Updates</SectionTitle>
        {loading && <StatusText>Loading latest updates...</StatusText>}
        {!loading && error && <StatusText>Unable to load updates right now.</StatusText>}
        {!loading && !error && newsItems.length === 0 && <StatusText>No updates available yet.</StatusText>}
        {!loading && !error && newsItems.length > 0 && (
          <>
            <NewsList>
              {newsItems.map(item => (
                <li key={item.link}>
                  <NewsLink href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </NewsLink>
                </li>
              ))}
            </NewsList>
            <MoreLink href="https://docs.learngala.com/blog" target="_blank" rel="noopener noreferrer">
              More
            </MoreLink>
          </>
        )}
      </StyledCatalogSection>
    </Columns>
  )
}

export default AboutHowToNews

const Columns = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`

const BodyText = styled.p`
  color: #ebeae4;
  line-height: 1.4;
  margin: 0 0 10px;
  hyphens: auto;
`

const VideoFrame = styled.iframe`
  border: 0;
  border-radius: 2px;
  min-height: 180px;
  width: 100%;
`

const LinkList = styled.ul`
  margin: 0;
  padding-left: 22px;

  li {
    color: #ebeae4;
  }

  li::marker {
    color: #ebeae4;
  }
`

const HowToLink = styled.a`
  align-items: center;
  color: #ebeae4;
  display: inline-flex;
  line-height: 1.8;

  &:hover {
    color: #ebeae4;
    text-decoration: underline;
  }
`

const HowToIcon = styled.span`
  color: #ebeae4;
  margin-right: 8px;
`

const NewsList = styled.ul`
  margin: 0;
  padding-left: 22px;

  li {
    color: #ebeae4;
    margin-bottom: 8px;
  }

  li:last-child {
    margin-bottom: 0;
  }

  li::marker {
    color: #ebeae4;
  }
`

const NewsLink = styled.a`
  color: #ebeae4;
  line-height: 1.35;

  &:hover {
    color: #ebeae4;
    text-decoration: underline;
  }
`

const AboutList = styled.ul`
  margin: 0 0 12px;
  padding-left: 22px;

  li {
    color: #ebeae4;
    margin-bottom: 8px;
  }

  li:last-child {
    margin-bottom: 0;
  }

  li::marker {
    color: #ebeae4;
  }
`

const AboutLink = styled.a`
  color: #ebeae4;
  line-height: 1.35;

  &:hover {
    color: #ebeae4;
    text-decoration: underline;
  }
`

const StatusText = styled.p`
  color: #ebeae4;
  margin: 0;
`

const StyledCatalogSection = styled(CatalogSection)`
  padding: 16px;
`

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
`

const SocialLink = styled.a`
  align-items: center;
  display: inline-flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`

const SocialIcon = styled.svg`
  color: #ebeae4;
  height: 24px;
  width: 24px;
`

const MoreLink = styled.a`
  color: #ebeae4;
  display: table;
  margin-left: auto;
  margin-top: 10px;

  &:hover {
    color: #ebeae4;
    text-decoration: underline;
  }
`
