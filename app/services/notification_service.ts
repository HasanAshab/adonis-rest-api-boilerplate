import config from '@adonisjs/core/services/config'
import type User from '#app/models/user'
import Token from '#app/models/token'


export default class NotificationService {
  public channels() {
    return Object.keys(config.get('notification.channels'))
  }
  
  public defaultChannelPreferences(enabled = true) {
    return this.channels().reduce((channelPreference, channel) => {
      channelPreference[channel] = enabled
      return channelPreference
    }, {})
  }
  
  public emailUnsubscriptionTokenKey(user: User, notificationType: string) {
    return `${notificationType}_${user.id}`
  }
  
  public emailResubscriptionTokenKey(user: User, notificationType: string) {
    return `${notificationType}_${user.id}`
  }
  
  public emailUnsubscriptionToken(user: User, notificationType: string) {
    const key = this.emailUnsubscriptionTokenKey(user, notificationType)
    return Token.sign('email_unsubscription', key, {
      oneTimeOnly: true
    })
  }
  
  public emailResubscriptionToken(user: User, notificationType: string) {
    const key = this.emailResubscriptionTokenKey(user, notificationType)
    return Token.sign('email_resubscription', key, {
      oneTimeOnly: true
    })
  }
}