import config from '@adonisjs/core/services/config'
import type User from '#models/user'
import Token from '#models/token'

export default class NotificationService {
  channels() {
    return Object.keys(config.get('notification.channels'))
  }

  defaultChannelPreferences(enabled = true) {
    return this.channels().reduce((channelPreference, channel) => {
      channelPreference[channel] = enabled
      return channelPreference
    }, {})
  }

  emailUnsubscriptionTokenKey(user: User, notificationType: string) {
    return `${notificationType}_${user.id}`
  }

  emailResubscriptionTokenKey(user: User, notificationType: string) {
    return `${notificationType}_${user.id}`
  }

  emailUnsubscriptionToken(user: User, notificationType: string) {
    const key = this.emailUnsubscriptionTokenKey(user, notificationType)
    return Token.sign('email_unsubscription', key, {
      oneTimeOnly: true,
    })
  }

  emailResubscriptionToken(user: User, notificationType: string) {
    const key = this.emailResubscriptionTokenKey(user, notificationType)
    return Token.sign('email_resubscription', key, {
      oneTimeOnly: true,
    })
  }
}
