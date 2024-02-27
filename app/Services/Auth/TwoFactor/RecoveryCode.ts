import { string } from "@adonisjs/core/helpers/string";

export default class RecoveryCode {
  public static generate() {
    return string.generateRandom(10) + '-' + string.generateRandom(10)
  }
}