function inspect(value) {
  if (typeof value === 'string') return value;
  if (value == null) return String(value);

  try {
    return JSON.stringify(value);
  } catch (_error) {
    return Object.prototype.toString.call(value);
  }
}

module.exports = inspect;
