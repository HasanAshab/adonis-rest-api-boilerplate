import Config from '@ioc:Adonis/Core/Config'
import type User from '#app/Models/User'
import Token from '#app/Models/Token'


export default class NotificationService {
  public channels() {
    return Object.keys(Config.get('notification.channels'))
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