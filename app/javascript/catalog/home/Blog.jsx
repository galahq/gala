import * as React from 'react'

export default function Blog() {
  const [feed, setFeed] = React.useState([])
  React.useEffect(() => {
    fetch('https://corsproxy.io/?https://docs.learngala.com/blog/rss.xml', {})
      .then(response => response.text())
      .then(text => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/xml')
        handle_feed(doc)
      })
      .catch(error => {
        console.log(error)
      })
  }, [])

  function handle_feed(doc) {
    for (let i = 0; i < doc.querySelectorAll('item').length; i++) {
      let item = doc.querySelectorAll('item')[i]
      let title = item.querySelector('title').textContent
      let link = item.querySelector('link').textContent
      let pubDate = truncate(item.querySelector('pubDate').textContent, 4)
      let description = item
        .querySelector('description')
        .textContent.slice(0, 100)
      setFeed(feed => [...feed, { title, link, pubDate, description }])
    }
  }
  function truncate(str, no_words) {
    // Split the input string into an array of words using the space character (" ") as the delimiter, then extract a portion of the array containing the specified number of words using the splice method, and finally join the selected words back into a single string with spaces between them
    return str
      .split(' ')
      .splice(0, no_words)
      .join(' ')
  }

  function FeedElement({ title, link, pubDate, description }) {
    return (
      <div className='feedElement'>
        <b>{title}</b>
        
        <p>  {description}...</p> 
        <p>
          <small
            className='dateAndLink'
          >
            <span className='date'>{pubDate}</span>
            <span className='link'>
              <a href={link}>Read more</a>
            </span>
          </small>
        </p>
        </div>
    )
  }
  function RenderedFeed({ feed }) {
    return feed.map(
      (item, index) =>
        index < 4 && (
          <FeedElement
            key={index}
            title={item.title}
            link={item.link}
            pubDate={item.pubDate}
            description={item.description}
          />
        )
    )
  }

  return (
    <>
      <div className='blog'>
        <h3>Recent Updates</h3>
        <RenderedFeed className='feed' feed={feed} />
        <p>
          <a
            href="https://docs.learngala.com/blog"
            className='moreLink'
          >
            See all
          </a>
        </p>
      </div>
    </>
  )
}
