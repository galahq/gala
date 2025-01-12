/* @noflow */

module.exports = {
  modulePathIgnorePatterns: [
    '<rootDir>/vendor/'
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'yml'],
  modulePaths: ['<rootDir>/app/javascript'],
  setupFilesAfterEnv: ['<rootDir>/spec/support/jest-setup.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.ya?ml?$': 'yaml-jest',
  },
}
