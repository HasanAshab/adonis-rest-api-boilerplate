import app from '@adonisjs/core/services/app'

const recaptcha = await app.container.make('recaptcha')
export { recaptcha as default }
