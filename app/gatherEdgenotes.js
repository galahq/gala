import mapNL from './mapNL.js'

var gatherEdgenotes = (contents) => {
  var contentsNode = document.createElement('div')
  contentsNode.innerHTML = contents
  var aNodes = contentsNode.querySelectorAll('a')
  return mapNL(aNodes, (a) => {
    return /p=([^&]+)/.exec(a.getAttribute('href'))[1]
  })
}

export default gatherEdgenotes
