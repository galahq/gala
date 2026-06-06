module.exports = {
  custom:
    typeof Symbol === 'function' && Symbol.for
      ? Symbol.for('nodejs.util.inspect.custom')
      : undefined,
};
