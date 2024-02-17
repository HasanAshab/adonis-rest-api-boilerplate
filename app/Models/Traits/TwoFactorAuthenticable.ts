import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export type TwoFactorMethod = 'app' | 'sms' | 'call'

export default function TwoFactorAuthenticable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    public static boot() {
      if (this.booted) return
      super.boot()
      
      column()(this.prototype, 'twoFactorMethod')
      column({ serializeAs: null })(this.prototype, 'twoFactorSecret')
      column({ serializeAs: null })(this.prototype, 'recoveryCodes')
    }

    public twoFactorMethod: TwoFactorMethod
    public twoFactorSecret: string
    public recoveryCodes?: string[]
    
    public twoFactorEnabled() {
      return !!this.twoFactorSecret
    }

  }
}
