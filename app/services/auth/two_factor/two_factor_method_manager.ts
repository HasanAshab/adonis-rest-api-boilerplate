import TwoFactorMethod from '#services/auth/two_factor/methods/abstract/two_factor_method'

export class TwoFactorMethodManager {
  private methods = new Map<string, TwoFactorMethod>()

  names() {
    return Array.from(this.methods.keys())
  }

  add(MethodClass: typeof TwoFactorMethod) {
    const twoFactorMethod = new MethodClass()
    this.methods.set(twoFactorMethod.methodName, twoFactorMethod)
  }

  register(MethodClasses: (typeof TwoFactorMethod)[]) {
    MethodClasses.forEach((Method) => this.add(Method))
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
