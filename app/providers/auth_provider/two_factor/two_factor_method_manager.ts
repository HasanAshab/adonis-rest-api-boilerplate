import TwoFactorMethod from './methods/abstract/two_factor_method.js'


export default class TwoFactorMethodManager {
  private methods = new Map<string, TwoFactorMethod>()
  
  public names() {
    return Array.from(this.methods.keys())
  }
  
  public add(MethodClass: typeof TwoFactorMethod) {
    const twoFactorMethod = new MethodClass()
    this.methods.set(twoFactorMethod.methodName, twoFactorMethod)
  }
  
  public register(MethodClasses: typeof TwoFactorMethod[]) {
    MethodClasses.forEach(Method => this.add(Method))
  }
  
  public use(methodName: string) {
    const method = this.methods.get(methodName)
    if(!method) {
      throw new Error(`Two-Factor Authentication method "${methodName}" was not registered`)
    }
    return method
  }
}