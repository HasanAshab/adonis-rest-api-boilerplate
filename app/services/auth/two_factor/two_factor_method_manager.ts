import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import TwoFactorMethod from '#services/auth/two_factor/methods/abstract/two_factor_method'
import app from '@adonisjs/core/services/app'

export class TwoFactorMethodManager {
  private methods = new Map<string, TwoFactorMethod>()

  names() {
    return Array.from(this.methods.keys())
  }

  async add(MethodClass: NormalizeConstructor<typeof TwoFactorMethod>) {
    const twoFactorMethod = await app.container.make(MethodClass)
    this.methods.set(twoFactorMethod.methodName, twoFactorMethod)
  }

  async register(MethodClasses: NormalizeConstructor<typeof TwoFactorMethod>[]) {
    await Promise.all(MethodClasses.map((Method) => this.add(Method)))
  }

  use(methodName: string) {
    const method = this.methods.get(methodName)
    if (!method) {
      throw new Error(`Two-Factor Authentication method "${methodName}" was not registered`)
    }
    return method
  }
}

export default new TwoFactorMethodManager()
