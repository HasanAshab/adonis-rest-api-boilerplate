import app from '@adonisjs/core/services/app'

const twilio = await app.container.make('twilio')
export { twilio as default }