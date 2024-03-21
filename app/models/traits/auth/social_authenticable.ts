import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default function SocialAuthenticable(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class SocialAuthenticableUser extends Superclass {
    @column({ serializeAs: null })
    declare socialProvider?: string

    @column({ serializeAs: null })
    declare socialId?: string

    @column()
    declare socialAvatarUrl?: string

    declare password: string | null

    isNative(): this is typeof this & { password: string } {
      return !!this.password
    }

    isSocial(): this is typeof this & { password: null } {
      return !!!this.password
    }
    
    static natives() {
      return this.query().whereNotNull('password')
    }
    
    static socials() {
      return this.query().whereNull('password')
    }
  }

  return SocialAuthenticableUser
}
