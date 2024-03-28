import { TwoFactorAuthenticableModelContract } from '#models/traits/auth/two_factor_authenticable'
import { Exception } from '@adonisjs/core/exceptions'

export default abstract class TwoFactorMethod {
  abstract methodName: string

  protected assertAssignable(_: TwoFactorAuthenticableModelContract): void | Promise<void> {}

  protected abstract verificationFailureException(): Exception
  protected abstract verificationFailureException(user: TwoFactorAuthenticableModelContract): Exception

  protected abstract setup(user: TwoFactorAuthenticableModelContract): void | Promise<void>
  protected abstract cleanup(user: TwoFactorAuthenticableModelContract): void | Promise<void>

  async enable(user: TwoFactorAuthenticableModelContract) {
    await this.assertAssignable(user)
    user.twoFactorEnabled = true
    user.twoFactorMethod = this.methodName
    await this.setup(user)
    await user.save()
  }

  shouldDisable(_: TwoFactorAuthenticableModelContract) {
    return false
  }

  async disable(user: TwoFactorAuthenticableModelContract) {
    if (user.hasEnabledTwoFactorAuth()) {
      user.twoFactorEnabled = false
      await this.cleanup(user)
      await user.save()
    }
  }

  async assign(user: TwoFactorAuthenticableModelContract) {
    await this.assertAssignable(user)
    user.twoFactorMethod = this.methodName
    await user.save()
  }

  challenge(_: TwoFactorAuthenticableModelContract): string | null | Promise<string | null> {
    return null
  }

  abstract isValid(user: TwoFactorAuthenticableModelContract, token: string): boolean | Promise<boolean>

  async verify(user: TwoFactorAuthenticableModelContract, token: string) {
    if (!(await this.isValid(user, token))) {
      throw this.verificationFailureException(user)
    }
  }
}
