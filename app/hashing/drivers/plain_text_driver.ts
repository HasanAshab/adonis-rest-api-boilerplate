import { HashDriverContract, ManagerDriverFactory } from '@adonisjs/core/types/hash'

export class PlainTextDriver implements HashDriverContract {
  isValidHash(value: string) {
    return true
  }

  async make(value: string) {
    return value
  }

  async verify(hashedValue: string, plainValue: string) {
    return hashedValue === plainValue
  }

  needsReHash(value: string) {
    return false
  }
}

export function plainTextDriver(): ManagerDriverFactory {
  return () => new PlainTextDriver()
}
