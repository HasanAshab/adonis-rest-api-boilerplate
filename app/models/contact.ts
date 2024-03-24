import BaseModel from '#models/base_model'
import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import { column } from '@adonisjs/lucid/orm'
import HasFactory from '#models/traits/has_factory/mixin'
import ContactFactory from '#database/factories/contact_factory'

//import Searchable from 'app/models/traits/searchable';

export default class Contact extends compose(BaseModel, HasFactory) {
  static factoryClass = ContactFactory
  
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare subject: string

  @column()
  declare message: string

  @column()
  status: 'opened' | 'closed' = 'opened'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  isOpened() {
    return this.status === 'opened'
  }

  isClosed() {
    return !this.isOpened()
  }

  open() {
    this.status = 'opened'
    return this.save()
  }

  close() {
    this.status = 'closed'
    return this.save()
  }

  static open(id: number) {
    return this.updateOrFail(id, {
      status: 'opened',
    })
  }

  static close(id: number) {
    return this.updateOrFail(id, {
      status: 'closed',
    })
  }
}

//ContactSchema.index({ subject: 'text', message: 'text' });
