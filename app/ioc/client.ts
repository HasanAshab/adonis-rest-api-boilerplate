import app from '@adonisjs/core/services/app'

const client = await app.container.make('client')
export { client as default }