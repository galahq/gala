/**
 *
 */

import { Application } from 'stimulus'
import { definitionsFromContext } from 'stimulus/webpack-helpers'

const application = Application.start()
const context = require.context('../controllers', true, /^(?!.*__tests__).+\.js$/)
application.load(definitionsFromContext(context))
