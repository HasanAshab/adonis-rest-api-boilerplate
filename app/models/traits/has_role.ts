import type { NormalizeConstructor } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type Role = 'user' | 'admin'

export default function HasRole(Superclass: NormalizeConstructor<typeof BaseModel>) {
  class HasRoleModel extends Superclass {
    @column()
    role: Role = 'user'

    get isAdmin() {
      return this.role === 'admin'
    }

    static withRole(role: Role) {
      return this.where('role', role)
    }
  }
  return HasRoleModel
}
