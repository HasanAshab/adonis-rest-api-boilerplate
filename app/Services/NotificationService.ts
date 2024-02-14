import Config from '@ioc:Adonis/Core/Config'

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
}