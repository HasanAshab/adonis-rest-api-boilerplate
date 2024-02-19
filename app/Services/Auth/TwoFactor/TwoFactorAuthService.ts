import { range } from 'lodash'
import Encryption from '@ioc:Adonis/Core/Encryption'
import Config from '@ioc:Adonis/Core/Config'
import User from 'App/Models/User'
import RecoveryCode from 'App/Services/Auth/TwoFactor/RecoveryCode'
import Otp from 'App/Services/Auth/TwoFactor/Otp'
import { authenticator } from 'otplib';
import PhoneNumberRequiredException from 'App/Exceptions/PhoneNumberRequiredException'
import InvalidOtpException from 'App/Exceptions/InvalidOtpException'
import InvalidRecoveryCodeException from 'App/Exceptions/InvalidRecoveryCodeException'


export default class TwoFactorAuthService {
  public async enable(user: User, method: User['twoFactorMethod']) {
    if (!user.phoneNumber && method !== 'app') {
      throw new PhoneNumberRequiredException()
    }

    user.twoFactorSecret = authenticator.generateSecret()
    user.twoFactorMethod = method
    
    await user.save()
  }

  public async disable(user: User) {
    if(!user.hasEnabledTwoFactorAuth()) return
    user.twoFactorSecret = null
    await user.save()
  }
  
  public async changeMethod(user: User, method: User['twoFactorMethod']) {
    if(!user.hasEnabledTwoFactorAuth() || user.twoFactorMethod === method) {
      return 
    }
    
    if (!user.phoneNumber && method !== 'app') {
      throw new PhoneNumberRequiredException()
    }

    user.twoFactorMethod = method
    await user.save()
  }
  
  public async challenge(user: User) {
    if (!user.phoneNumber || user.twoFactorMethod === 'app') {
      return
    }
    
    if (user.twoFactorMethod === 'sms') {
      return await Otp.sendThroughSMS(user)
    }
    
    if (user.twoFactorMethod === 'call') {
      return await Otp.sendThroughCall(user)
    }
  }
  
  public async verify(email: string, token: string) {
    const user = await User.findByOrFail('email', email)
    const isValid = (user.twoFactorMethod === 'app')
      ? authenticator.check(token, user.twoFactorSecret)
      : Otp.isValid(user, token)

    if (!isValid) {
      throw new InvalidOtpException()
    }
    
    return await user.createToken()
  }

  public async recover(email: string, code: string) {
    const user = await User.findByOrFail('email', email)
    if(await user.isValidRecoveryCode(user, code)) {
      return await user.createToken()
    }
    throw new InvalidRecoveryCodeException()
  }

  public async generateRecoveryCodes(user: User, count = 8) {
    const codes = range(count).map(RecoveryCode.generate)
    user.twoFactorRecoveryCodes = Encryption.encrypt(JSON.stringify(codes))
    await user.save()
    return codes
  }
}
