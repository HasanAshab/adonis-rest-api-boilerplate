import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import Authenticable from '#models/traits/auth/authenticable'
import { BaseModel, column, manyToMany, beforeUpdate } from '@adonisjs/lucid/orm'
import encryption from '@adonisjs/core/services/encryption'
import twoFactorMethod from '#services/auth/two_factor/two_factor_method_manager'
import RecoveryCode from '#services/auth/two_factor/recovery_code'
import LoggedDevice from '#models/logged_device'
import { authenticator } from 'otplib'
import qrcode from 'qrcode'


export type TwoFactorAuthenticableModelContract = InstanceType<ReturnType<typeof TwoFactorAuthenticable>>

export default function TwoFactorAuthenticable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class TwoFactorAuthenticableModel extends compose(Superclass, Authenticable) {
    @column()
    twoFactorEnabled = false

    @column()
    twoFactorMethod: string | null = null

    @column({ serializeAs: null })
    twoFactorSecret: string | null = null

    @column({ serializeAs: null })
    twoFactorRecoveryCodes: string | null = null

    @manyToMany(() => LoggedDevice, {
      pivotTable: 'trusted_devices',
      pivotColumns: ['ip_address', 'last_logged_at'],
      pivotTimestamps: {
        createdAt: false,
        updatedAt: 'last_logged_at'
      },
    })
    declare trustedDevices: ManyToMany<typeof LoggedDevice>

    hasEnabledTwoFactorAuth(): this is this & { twoFactorMethod: string, twoFactorSecret: string } {
      return this.twoFactorEnabled && !!this.twoFactorMethod && !!this.twoFactorSecret
    }

    recoveryCodes(): string[] {
      return this.twoFactorRecoveryCodes
        ? JSON.parse(encryption.decrypt<string>(this.twoFactorRecoveryCodes)!)
        : []
    }

    isValidRecoveryCode(code: string) {
      return !!this.recoveryCodes().find((recoveryCode) => recoveryCode === code)
    }

    replaceRecoveryCode(code: string) {
      if(!this.twoFactorRecoveryCodes) return
      this.twoFactorRecoveryCodes = encryption.encrypt(
        encryption.decrypt<string>(this.twoFactorRecoveryCodes)!.replace(code, RecoveryCode.generate())
      )
      return this.save()
    }

    twoFactorQrCodeUrl() {
      return this.twoFactorSecret && this.twoFactorMethod
        ? authenticator.keyuri(this.email, this.twoFactorMethod, this.twoFactorSecret)
        : null
    }

    async twoFactorQrCodeSvg() {
      const url = this.twoFactorQrCodeUrl()
      if(!url) return null
      return await qrcode.toString(url, { type: 'svg' })
    }

    isDeviceTrusted(deviceOrId: LoggedDevice | string) {
      const id = typeof deviceOrId === 'string' ? deviceOrId : deviceOrId.id
      return this.related('trustedDevices' as any).query().where('logged_device_id', id).exists()
    }

    trustDevice(deviceOrId: LoggedDevice | string, ipAddress: string) {
      const id = typeof deviceOrId === 'string' ? deviceOrId : deviceOrId.id
      return this.related('trustedDevices' as any).attach({
        [id]: { ip_address: ipAddress },
      })
    }

    distrustDevice(deviceOrId: LoggedDevice | string) {
      const id = typeof deviceOrId === 'string' ? deviceOrId : deviceOrId.id
      return this.related('trustedDevices' as any).detach([id])
    }

    @beforeUpdate()
    static async checkWetherToDisableTwoFactorAuth(user: TwoFactorAuthenticableModel) {
      if (!user.hasEnabledTwoFactorAuth()) return
      const method = twoFactorMethod.use(user.twoFactorMethod)
      method.shouldDisable(user) && (await method.disable(user))
    }
  }

  return TwoFactorAuthenticableModel
}
