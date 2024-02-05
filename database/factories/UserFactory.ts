import Factory from 'App/Models/Traits/HasFactory/Factory'
import User from 'App/Models/User'

export default class UserFactory extends Factory<User> {
  definition() {
    return {
      name: this.faker.person.firstName(),
      username: this.faker.person.firstName(),
      email: this.faker.internet.email(),
      password: 'password',
      role: 'user',
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

  hasSettings(enableTwoFactorAuth = false, method: TwoFactorAuthMethod = 'sms') {
    return this.external((user: User) => {
      return user.related('settings').create({
        twoFactorAuth: {
          enabled: enableTwoFactorAuth,
          method,
          secret: null,
        },
      })
    })
  }
}
