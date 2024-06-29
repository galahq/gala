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
      let description = truncate(item.querySelector('description').textContent, 15)
      setFeed(feed => [...feed, { title, link, pubDate, description }])
    }
  }
  function truncate(str, no_words) {
    // Split the input string into an array of words using the space character (" ") as the delimiter, then extract a portion of the array containing the specified number of words using the splice method, and finally join the selected words back into a single string with spaces between them
    return str.split(" ").splice(0,no_words).join(" ");
}
  function RenderedFeed ({ feed }) {
    return feed.map((item, index) => index < 4 && ( 
      <div key={index}>
        <b>{item.title}</b>
        <p><small>{item.pubDate}</small></p>
        <p>{item.description}... <small><em><a href={item.link}>Read more</a></em></small></p>
      </div>
    ))
  }
  

  return (
    <>
      <h2>Gala Updates!</h2>
      <RenderedFeed feed={feed} />
      <p><a href='https://docs.learngala.com/blog'>See all</a> </p>
    </>
  )
}
