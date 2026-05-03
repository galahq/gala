/* @flow */

require('jest-dom/extend-expect')
require('react-testing-library/cleanup-after-each')

global.fetch = require('jest-fetch-mock')
