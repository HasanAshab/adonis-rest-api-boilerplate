import app from '@adonisjs/core/services/app'
import Recaptcha from 'recaptcha2'

const recaptcha = await app.container.make(Recaptcha)
export { recaptcha as default }