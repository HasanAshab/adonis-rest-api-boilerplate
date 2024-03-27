import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
//import { NotificationFactory } from '#factories/notification_factory'
import { stringToLuxonDate } from '#app/helpers'


export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      name: faker.person.firstName(),
      username: faker.person.firstName(),
      email: faker.internet.email(),
      password: 'password',
      verified: true,
    }
  })
  .state('unverified', user => (user.verified = false))
  .state('hasPhoneNumber', user => (user.phoneNumber = '+15005550006'))
  .state('admin', user => (user.role = 'admin'))
  .state('registeredPreviousWeek', user => {
    user.createdAt = stringToLuxonDate('-1')
  })
  .state('social', user => {
    user.password = null
    user.socialProvider = 'google'
    user.socialId = '1000'    
  })
  .state('twoFactorAuthenticableThroughAuthenticator', user => {
    user.twoFactorEnabled = true
    user.twoFactorSecret = '2fa-secret'
    user.twoFactorMethod = 'authenticator'
  })
  .state('twoFactorAuthenticableThroughSms', user => {
    user.twoFactorEnabled = true
    user.twoFactorSecret = '2fa-secret'
    user.twoFactorMethod = 'sms'
  })
  .state('twoFactorAuthenticableThroughCall', user => {
    user.twoFactorEnabled = true
    user.twoFactorSecret = '2fa-secret'
    user.twoFactorMethod = 'call'
  })
  //.relation('notifications', () => NotificationFactory)
  .build()