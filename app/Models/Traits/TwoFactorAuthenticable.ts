import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import Encryption from '@ioc:Adonis/Core/Encryption'
import RecoveryCode from 'App/Services/Auth/TwoFactor/RecoveryCode'
import { authenticator } from 'otplib';
import qrcode from 'qrcode';


type TwoFactorEnabled<T> = Required<Pick<T, 'twoFactorMethod' | 'twoFactorSecret'>>;


export default function TwoFactorAuthenticable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    public static boot() {
      if (this.booted) return
      super.boot()
      
      column()(this.prototype, 'twoFactorEnabled')
      column()(this.prototype, 'twoFactorMethod')
      column({ serializeAs: null })(this.prototype, 'twoFactorSecret')
      column({ serializeAs: null })(this.prototype, 'twoFactorRecoveryCodes')
    }

    public twoFactorEnabled: boolean
    public twoFactorMethod?: string
    public twoFactorSecret?: string
    public twoFactorRecoveryCodes?: string
    
    public hasEnabledTwoFactorAuth() {
      return this.twoFactorEnabled
    }
    
    public recoveryCodes() {
      return this.twoFactorRecoveryCodes 
        ? JSON.parse(Encryption.decrypt(this.twoFactorRecoveryCodes))
        : []
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
      return this.twoFactorSecret
        ? authenticator.keyuri(this.email, this.twoFactorMethod, this.twoFactorSecret)
        : null
    }
    
    public twoFactorQrCodeSvg() {
      return this.twoFactorSecret
        ? qrcode.toString(this.twoFactorQrCodeUrl(), { type: 'svg' })
        : null
    }
  }
}