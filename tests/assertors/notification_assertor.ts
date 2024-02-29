import { BaseMailer } from '@ioc:adonis/addons/mail'
import Assertor from './assertor'
import Notification, { NotifiableModel } from '@ioc:verful/notification'
import { isEqual } from 'lodash'

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

  public fake() {
    Notification.trap((_, to) => {
      this.notifiables.push(this.extractData(to))
    })
  }

  public isSentTo(user: NotifiableModel) {
    return !!this.notifiables.find((notifiable) => {
      return isEqual(notifiable, this.extractData(user))
    })
  }

  public assertSentTo(users: NotifiableModel | NotifiableModel[]) {
    if (Array.isArray(users)) {
      return users.forEach((user) => this.assertSentTo(user))
    }
    this.assertTrue(this.isSentTo(users))
  }

  public assertNotSentTo(users: NotifiableModel | NotifiableModel[]) {
    if (Array.isArray(users)) {
      return users.forEach((user) => this.assertNotSentTo(user))
    }
    this.assertFalse(this.isSentTo(users))
  }

  public assertNothingSent() {
    this.assertTrue(this.notifiables.length === 0)
  }
}

export default new NotificationAssertor()
