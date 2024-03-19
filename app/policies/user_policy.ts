import { BasePolicy } from '@adonisjs/bouncer'
import User from '#models/user'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  delete(user: User, targetUser: User): AuthorizerResponse {
    return user.id === targetUser.id || (user.role === 'admin' && targetUser.role !== 'admin')
  }
}
