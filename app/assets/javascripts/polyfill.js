Array.prototype.remove = function(element) {
  if (null == this) throw new TypeError('"this" is null or not defined');
  var i = this.indexOf(element);
  if (i > -1) {
    this.splice(i, 1)
  }
  return this
}
