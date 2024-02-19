import { string } from '@ioc:Adonis/Core/Helpers'

export default class RecoveryCode {
  public static generate() {
    return string.generateRandom(10) + '-' + string.generateRandom(10)
  }
}