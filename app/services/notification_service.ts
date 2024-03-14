import config from '@adonisjs/core/services/config'
import type User from '#models/user'
import Token from '#models/token'


export default class NotificationService {
  public static channels() {
    return Object.keys(config.get('notification.channels'))
  }
  
  public static defaultChannelPreferences(enabled = true) {
    return this.channels().reduce((channelPreference, channel) => {
      channelPreference[channel] = enabled
      return channelPreference
    }, {})
  }
  
  public static emailUnsubscriptionTokenKey(user: User, notificationType: string) {
    return `${notificationType}_${user.id}`
  }
  
  public static emailResubscriptionTokenKey(user: User, notificationType: string) {
    return `${notificationType}_${user.id}`
  }
  
  public static emailUnsubscriptionToken(user: User, notificationType: string) {
    const key = this.emailUnsubscriptionTokenKey(user, notificationType)
    return Token.sign('email_unsubscription', key, {
      oneTimeOnly: true
    })
  }
  
  public static emailResubscriptionToken(user: User, notificationType: string) {
    const key = this.emailResubscriptionTokenKey(user, notificationType)
    return Token.sign('email_resubscription', key, {
      oneTimeOnly: true
    })
  }
}