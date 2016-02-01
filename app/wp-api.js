var fetchFromWP = (id, callback) => {
  $.ajax({
    type: 'GET',
    url: 'http://remley.wcbn.org/ihih-msc/index.php',
    data: [
      {name: 'rest_route', value: `/wp/v2/posts/${id}`}
    ],
    dataType: 'json',
    success: (response) => {
      callback(response)
    }
  })
}

export default fetchFromWP
