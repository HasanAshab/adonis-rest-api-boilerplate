import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import encryption from '@adonisjs/core/services/encryption'
import RecoveryCode from '#services/auth/two_factor/recovery_code'
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

    declare twoFactorEnabled = false
    declare twoFactorMethod: string | null = null
    declare twoFactorSecret: string | null = null
    declare twoFactorRecoveryCodes: string | null = null
    
    public hasEnabledTwoFactorAuth() {
      return this.twoFactorEnabled
    }
    
    public recoveryCodes() {
      return this.twoFactorRecoveryCodes 
        ? JSON.parse(encryption.decrypt(this.twoFactorRecoveryCodes))
        : []
    }
    

    public isValidRecoveryCode(code: string) {
      return !!this.recoveryCodes().find(recoveryCode => recoveryCode === code)
    }
    
    public replaceRecoveryCode(code: string) {
      this.twoFactorRecoveryCodes = encryption.encrypt(
        encryption.decrypt(this.twoFactorRecoveryCodes).replace(code, RecoveryCode.generate())
      )
      return this.save()
    }
    
    public twoFactorQrCodeUrl() {
      return this.twoFactorSecret
        ? authenticator.keyuri(this.email, this.twoFactorMethod, this.twoFactorSecret)
        : null
    }
    
    public async twoFactorQrCodeSvg() {
      return this.twoFactorSecret
        ? await qrcode.toString(this.twoFactorQrCodeUrl(), { type: 'svg' })
        : null
    }
  }
}