import { BaseEvent } from '@adonisjs/core/events'
import User from '#models/user'

export default class Registered extends BaseEvent {
  constructor(
    public user: User,
    public method: 'internal' | 'social',
    public version: string
  ) {
    super()
  }
}
