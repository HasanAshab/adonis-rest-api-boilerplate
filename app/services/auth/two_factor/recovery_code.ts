import string from '@adonisjs/core/helpers/string'

export default class RecoveryCode {
  static generate() {
    return string.generateRandom(10) + '-' + string.generateRandom(10)
  }
}
