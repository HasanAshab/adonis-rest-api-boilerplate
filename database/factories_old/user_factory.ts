import Factory from '#models/traits/has_factory/factory'
import User from '#models/user'
import { stringToLuxonDate } from '#app/helpers'

export default class UserFactory extends Factory<User> {
  definition() {
    return {
      name: this.faker.person.firstName(),
      username: this.faker.person.firstName(),
      email: this.faker.internet.email(),
      password: 'password',
      verified: true,
    }
  }

  unverified() {
    return this.state((user) => {
      user.verified = false
      return user
    })
  }

  social(provider = 'google', id = '100000') {
    return this.state((user) => {
      user.password = null
      user.socialProvider = provider
      user.socialId = id
      return user
    })
  }

  withRole(name: User['role']) {
    return this.state((user) => {
      user.role = name
      return user
    })
  }

  withPhoneNumber(phoneNumber = '+15005550006') {
    return this.state((user) => {
      user.phoneNumber = phoneNumber
      return user
    })
  }

  twoFactorAuthEnabled(method = 'authenticator') {
    return this.state((user) => {
      user.twoFactorEnabled = true
      user.twoFactorSecret = '2fa-secret'
      user.twoFactorMethod = method
      return user
    })
  }

  hasNotificationPreferences() {
    return this.external(async (user) => {
      await user.initNotificationPreference()
    })
  }

  registeredBefore(time: string) {
    return this.state((user) => {
      user.createdAt = stringToLuxonDate('-' + time)
      return user
    })
  }
}
