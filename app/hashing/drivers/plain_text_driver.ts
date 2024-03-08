import {
  HashDriverContract,
  ManagerDriverFactory
} from '@adonisjs/core/types/hash'


export class PlainTextDriver implements HashDriverContract {
  public isValidHash(value: string) {
    return true
  }

  public async make(value: string) {
    return value
  }

  public async verify(hashedValue: string, plainValue: string) {
    return hashedValue === plainValue
  }

  public needsReHash(value: string) {
    return false
  }
}

export function plainTextDriver (): ManagerDriverFactory {
  return () => new PlainTextDriver()
}
