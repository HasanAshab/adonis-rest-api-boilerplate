import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

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
