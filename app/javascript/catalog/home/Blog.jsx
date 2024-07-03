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
      setFeed(feed => [...feed, {title, link}])
    }
  }
    function FeedElement({ title, link}) {
    return (
      <div>
        <a
          href={link}
          className='feedLink'
        >
          {title}
        </a>
      </div>
    )
  }
  function RenderedFeed({ feed }) {
    return (<>
    <ul>
    {feed.map(
      (item, index) =>
        index < 4 && (
          <li key={index}>
          <FeedElement
            key={index}
            title={item.title}
            link={item.link}
          />
          </li>
    ))}
    </ul>
    </>)
  }

  return (
    <>
      <div className='blog'>
        <h4>Recent Updates</h4>
        <RenderedFeed className='feed' feed={feed} />
        <div class='moreLink'>
          <a 
            href="https://docs.learngala.com/blog"
          >
        <p style={{textAlign: 'center'}}>
            See all
        </p>
          </a>
          </div>
      </div>
    </>
  )
}
