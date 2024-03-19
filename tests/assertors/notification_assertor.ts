import { BaseMailer } from '@ioc:adonis/addons/mail'
import Assertor from './assertor.js'
import Notification, { NotifiableModel } from '@ioc:verful/notification'
import { isEqual } from 'lodash-es'

interface Notifiable {
  table: string
  id: number
}

export class NotificationAssertor extends Assertor {
  private notifiables: Notifiable[] = []

  private extractData(user: NotifiableModel) {
    return {
      table: user.constructor.table,
      id: user.id,
    }
  }

  fake() {
    Notification.trap((_, to) => {
      this.notifiables.push(this.extractData(to))
    })
  }

  isSentTo(user: NotifiableModel) {
    return !!this.notifiables.find((notifiable) => {
      return isEqual(notifiable, this.extractData(user))
    })
  }

  assertSentTo(users: NotifiableModel | NotifiableModel[]) {
    if (Array.isArray(users)) {
      return users.forEach((user) => this.assertSentTo(user))
    }
    this.assertTrue(this.isSentTo(users))
  }

  assertNotSentTo(users: NotifiableModel | NotifiableModel[]) {
    if (Array.isArray(users)) {
      return users.forEach((user) => this.assertNotSentTo(user))
    }
    this.assertFalse(this.isSentTo(users))
  }

  assertNothingSent() {
    this.assertTrue(this.notifiables.length === 0)
  }
}

export default new NotificationAssertor()
