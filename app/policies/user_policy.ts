import { BasePolicy } from '@ioc:adonis/addons/bouncer'
import User from '#models/user'

export default class UserPolicy extends BasePolicy {
  delete(user: User, targetUser: User) {
    return user.id === targetUser.id || (user.role === 'admin' && targetUser.role !== 'admin')
  }
}
