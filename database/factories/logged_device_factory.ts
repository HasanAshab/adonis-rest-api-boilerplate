import factory from '@adonisjs/lucid/factories'
import LoggedDevice from '#models/logged_device'

export const LoggedDeviceFactory = factory
  .define(LoggedDevice, async ({ faker }) => {
    return { id: faker.string.uuid() }
  })
  .build()