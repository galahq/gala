function mapNL(nodeList, callback) {
  var arr = [];
  for(var i = 0, ll = nodeList.length; i != ll; i++) {
    arr.push(callback(nodeList[i], i));
  }
  return arr;
}
export default mapNL
