import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type TwoFactorMethod = 'app' | 'sms' | 'call'

export default function SocialAuthenticable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    public static boot() {
      if (this.booted) return
      super.boot()
      
      column({ serializeAs: null })(this.prototype, 'socialProvider')
      column({ serializeAs: null })(this.prototype, 'socialId')
      column()(this.prototype, 'socialAvatarUrl')
    }
    
    public socialProvider?: string
    public socialId?: string
    public socialAvatarUrl?: string
  }
}
