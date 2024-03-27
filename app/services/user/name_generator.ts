import config from '@adonisjs/core/services/config'
import string from '@adonisjs/core/helpers/string'


export default class NameGenerator {
  static MAX_LENGTH = config.get<number>('app.constraints.user.username.maxLength')

  static maxLength(len: number) {
    this.MAX_LENGTH = len
    return this
  }
  
  static make(username: string) {
    return string.titleCase(string.noCase(username)).substring(0, this.MAX_LENGTH)
  }
}
