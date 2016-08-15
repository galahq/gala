var fetchFromWP = (params, callback) => {
  let {id, onlyMainText} = params
  let idString = id ? `/${id}` : ""
  let mainTextFilter = [onlyMainText ? {name: "filter[cat]", value: "190"} : {}]
  $.ajax({
    type: 'GET',
    url: 'http://remley.wcbn.org/ihih-msc/index.php',
    data: [
      {name: 'rest_route', value: `/wp/v2/posts${idString}`}
    ].concat(mainTextFilter),
    dataType: 'json',
    success: (response) => {
      callback(response)
    }
  })
}

export default fetchFromWP
