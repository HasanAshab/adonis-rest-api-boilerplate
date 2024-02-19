import { range } from 'lodash'
import Encryption from '@ioc:Adonis/Core/Encryption'
import Config from '@ioc:Adonis/Core/Config'
import User from 'App/Models/User'
import RecoveryCode from 'App/Services/Auth/TwoFactor/RecoveryCode'
import OtpService from 'App/Services/OtpService'
import speakeasy from 'speakeasy'
import PhoneNumberRequiredException from 'App/Exceptions/PhoneNumberRequiredException'
import InvalidOtpException from 'App/Exceptions/InvalidOtpException'
import InvalidRecoveryCodeException from 'App/Exceptions/InvalidRecoveryCodeException'


export interface TwoFactorAuthData {
  recoveryCodes: string[]
  otpAuthUrl?: string
}

export default class TwoFactorAuthService {
  public async enable(user: User, method = user.twoFactorMethod) {
    if (!user.phoneNumber && method !== 'app') {
      throw new PhoneNumberRequiredException()
    }

    const data: TwoFactorAuthData = {
      recoveryCodes: await this.generateRecoveryCodes(user),
    }

    user.twoFactorSecret = this.secret()
    user.twoFactorMethod = method ?? user.twoFactorAuthMethod

    if (method === 'app') {
      data.otpAuthUrl = this.otpAuthUrl(user)
    }

    await user.save()
    return data
  }

  public async disable(user: User) {
    if(!user.hasEnabledTwoFactorAuth()) return
    user.twoFactorSecret = null
    await user.save()
  }
  
  public changeMethod(user: User, method: User['twoFactorMethod']) {
    if(!user.hasEnabledTwoFactorAuth() || user.twoFactorMethod === method) {
      return 
    }
    
    if (!user.phoneNumber && method !== 'app') {
      throw new PhoneNumberRequiredException()
    }

    user.twoFactorSecret = this.secret()
    user.twoFactorMethod = method
    await user.save()

    if (method === 'app') {
      return this.otpAuthUrl(user)
    }
  }
  
  //todo
  public challenge(user: User, otpService = new OtpService) {
    if (!user.phoneNumber || user.twoFactorMethod === 'app') {
      return
    }
    
    if(user.twoFactorMethod === 'sms') {
      await otpService.sendThroughSMS(user.phoneNumber)
    }
    
    else if(user.twoFactorMethod === 'call') {
      await otpService.sendThroughCall(user.phoneNumber)
    }
  }
  
  //todo
  public async verify(email: string, token: string, otpService = new OtpService) {
    const user = await User.findByOrFail('email', email)
    let isValid = false

    if (user.twoFactorMethod === 'app') {
      isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'ascii',
        window: 2,
        token
      })
    } 
    else {
      isValid = await otpService.isValid(user.phoneNumber, token)
    }

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


  private secret(length = 20) {
    return speakeasy.generateSecret({ length }).ascii
  }
  
  private otpAuthUrl(user: User) {
    if (!user.twoFactorSecret) {
      throw new Error("Can not make otp auth url without having secret.")
    }
    return speakeasy.otpauthURL({
      secret: user.twoFactorSecret,
      label: Config.get('app.name'),
      issuer: Config.get('app.name'),
    })
  }
}
