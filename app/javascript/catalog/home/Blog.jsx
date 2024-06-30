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
    console.log('handle_feed called')
    for (let i = 0; i < doc.querySelectorAll('item').length; i++) {
      let item = doc.querySelectorAll('item')[i]
      let title = item.querySelector('title').textContent
      console.log(`title: ${title}, ${i}`)
      let link = item.querySelector('link').textContent
      let pubDate = truncate(item.querySelector('pubDate').textContent, 4)
      let description = item
        .querySelector('description')
        .textContent.slice(0, 75)
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

  const blog_styles = {
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
  }
  function RenderedFeed({ feed }) {
    return feed.map(
      (item, index) =>
        index < 4 && (
          <div style={blog_styles} key={index}>
            <b>{item.title}</b>
            <p>
              <small
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginRight: '2em',
                  color: '#F1F1F1',
                }}
              >
                <div style={{ flexDirection: 'left' }}>{item.pubDate}</div>
                <div style={{ flexDirection: 'right' }}>
                  <a href={item.link} style={{ color: 'white' }}>Read more</a>
                </div>
              </small>
            </p>
            <p style={{ color: '#FFFFF', paddingBottom: '1em' }}>
              {item.description}...
            </p>
          </div>
        )
    )
  }

  return (
    <>
      <div style={blog_styles}>
        <h3 style={{ color: 'white' }}>Recent Updates</h3>
        <RenderedFeed feed={feed} />
        <p>
          <a
            href="https://docs.learngala.com/blog"
            style={{
              margin: 'auto',
              color: 'white',
              outlineStyle: 'solid',
              outlineWidth: '1px',
              outlineColor: 'white',
              outlineOffset: '2px',
            }}
          ><div style={{ textAlign: 'center'}}>
            See all
          </div>
          </a>
        </p>
      </div>
    </>
  )
}
