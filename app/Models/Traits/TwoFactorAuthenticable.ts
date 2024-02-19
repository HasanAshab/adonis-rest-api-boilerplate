import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import Encryption from '@ioc:Adonis/Core/Encryption'
import RecoveryCode from 'App/Services/Auth/TwoFactor/RecoveryCode'
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';


export type TwoFactorMethod = 'app' | 'sms' | 'call'


export default function TwoFactorAuthenticable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    public static boot() {
      if (this.booted) return
      super.boot()
      
      column()(this.prototype, 'twoFactorMethod')
      column({ serializeAs: null })(this.prototype, 'twoFactorSecret')
      column({ serializeAs: null })(this.prototype, 'twoFactorRecoveryCodes')
    }

    public twoFactorMethod: TwoFactorMethod
    public twoFactorSecret: string
    public twoFactorRecoveryCodes: string[]
    
    public recoveryCodes() {
      return JSON.parse(Encryption.decrypt(this.twoFactorRecoveryCodes))
    }
    
    public hasEnabledTwoFactorAuth() {
      return !!this.twoFactorSecret
    }
    
    public isValidRecoveryCode(code: string) {
      return !!this.recoveryCodes().find(recoveryCode => recoveryCode === code)
    }
    
    public replaceRecoveryCode(code: string) {
      this.twoFactorRecoveryCodes = Encryption.encrypt(
        Encryption.decrypt(this.twoFactorRecoveryCodes).replace(code, RecoveryCode.generate())
      )
    }
    
    public twoFactorQrCodeUrl() {
      return otplib.authenticator.keyuri(this.email, this.twoFactorMethod, this.twoFactorSecret);
    }
    
    public twoFactorQrCodeSvg() {
      return qrcode.toString(this.twoFactorQrCodeUrl(), { type: 'svg' });
    }

  }
}