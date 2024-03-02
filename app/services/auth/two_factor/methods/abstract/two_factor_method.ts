import User from '#app/models/user'
import { Exception } from "@adonisjs/core/exceptions";

export default abstract class TwoFactorMethod {
  public abstract methodName: string
  
  protected assertAssignable(user: User): void | Promise<void> {}

  protected abstract verificationFailureException(): Exception
  protected abstract verificationFailureException(user: User): Exception
  
  protected abstract setup(user: User): void | Promise<void>
  protected abstract cleanup(user: User): void | Promise<void>

  public async enable(user: User) {
    await this.assertAssignable(user)
    user.twoFactorEnabled = true
    user.twoFactorMethod = this.methodName
    await this.setup(user)
    await user.save()
  }
  
  public async disable(user: User) {
    if(user.hasEnabledTwoFactorAuth()) {
      user.twoFactorEnabled = false
      await this.cleanup(user)
      await user.save()
    }
  }
  
  public async assign(user: User) {
    await this.assertAssignable(user)
    user.twoFactorMethod = this.methodName
    await user.save()
  }

  public challenge(user: User): string | null | Promise<string | null> {
    return null
  }
  
  public abstract isValid(user: User, token: string): boolean | Promise<boolean>
  
  public async verify(user: User, token: string) {
    if (!await this.isValid(user, token)) {
      throw this.verificationFailureException(user)
    }
  }
}