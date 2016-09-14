import mapNL from './mapNL.js'

var gatherEdgenotes = (contents) => {
  var contentsNode = document.createElement('div')
  contentsNode.innerHTML = contents
  var aNodes = contentsNode.querySelectorAll('a[data-edgenote]')
  return mapNL(aNodes, (a) => {
    return a.getAttribute('data-edgenote')
  })
}

export default gatherEdgenotes
