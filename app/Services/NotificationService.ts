import Config from '@ioc:Adonis/Core/Config'
import type User from 'App/Models/User'
import Token from 'App/Models/Token'


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
  
  public async emailUnsubscriptionToken(user: User, notificationType: string) {
    const { secret } = await Token.create({
      key: this.emailUnsubscriptionTokenKey(user, notificationType),
      type: 'email_unsubscription',
      oneTime: true
    })
    return secret
  }
  
  public async emailResubscriptionToken(user: User, notificationType: string) {
    const { secret } = await Token.create({
      key: this.emailResubscriptionTokenKey(user, notificationType),
      type: 'email_resubscription',
      oneTime: true
    })
    return secret
  }
}