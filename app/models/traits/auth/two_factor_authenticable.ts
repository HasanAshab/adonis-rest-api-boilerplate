import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, manyToMany, beforeUpdate } from '@adonisjs/lucid/orm'
import encryption from '@adonisjs/core/services/encryption'
import twoFactorMethod from '#services/auth/two_factor/two_factor_method_manager'
import RecoveryCode from '#services/auth/two_factor/recovery_code'
import LoggedDevice from '#models/logged_device'
import { authenticator } from 'otplib'
import qrcode from 'qrcode'

type TwoFactorEnabled<T> = Required<Pick<T, 'twoFactorMethod' | 'twoFactorSecret'>>

export default function TwoFactorAuthenticable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class TwoFactorAuthenticableUser extends Superclass {
    @column()
    twoFactorEnabled = false

    @column()
    twoFactorMethod: string | null = null

    @column({ serializeAs: null })
    twoFactorSecret: string | null = null

    @column({ serializeAs: null })
    twoFactorRecoveryCodes: string | null = null
    
    @manyToMany(() => LoggedDevice, {
      pivotTable: 'trusted_devices'
    })
    trustedDevices: ManyToMany<typeof LoggedDevice>
    
    hasEnabledTwoFactorAuth() {
      return this.twoFactorEnabled
    }

    recoveryCodes() {
      return this.twoFactorRecoveryCodes
        ? JSON.parse(encryption.decrypt(this.twoFactorRecoveryCodes))
        : []
    }

    isValidRecoveryCode(code: string) {
      return !!this.recoveryCodes().find((recoveryCode) => recoveryCode === code)
    }

    replaceRecoveryCode(code: string) {
      this.twoFactorRecoveryCodes = encryption.encrypt(
        encryption.decrypt(this.twoFactorRecoveryCodes).replace(code, RecoveryCode.generate())
      )
      return this.save()
    }

    twoFactorQrCodeUrl() {
      return this.twoFactorSecret
        ? authenticator.keyuri(this.email, this.twoFactorMethod, this.twoFactorSecret)
        : null
    }

    async twoFactorQrCodeSvg() {
      return this.twoFactorSecret
        ? await qrcode.toString(this.twoFactorQrCodeUrl(), { type: 'svg' })
        : null
    }
    
    isDeviceTrusted(id: string) {
      return this.related('trustedDevices')
        .query()
        .where('logged_device_id', id)
        .exists()
    }
    
    trustDevice(id: string) {
      return this.related('trustedDevices').attach(id)
    }
    
    @beforeUpdate()
    static async checkWetherToDisableTwoFactorAuth(user: TwoFactorAuthenticableUser) {
      if (!user.hasEnabledTwoFactorAuth()) return
      const method = twoFactorMethod.use(user.twoFactorMethod)
      method.shouldDisable(user) && (await method.disable(user))
    }
  }

  return TwoFactorAuthenticableUser
}
