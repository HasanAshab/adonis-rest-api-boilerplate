import BaseModel from '#models/base_model'
import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import { column } from '@adonisjs/lucid/orm'
import HasFactory from '#models/traits/has_factory/mixin'
//import Searchable from 'app/models/traits/searchable';

export default class Contact extends compose(BaseModel, HasFactory) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare subject: string

  @column()
  declare message: string

  @column()
  declare status: 'opened' | 'closed' = 'opened'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  public isOpened() {
    return this.status === 'opened'
  }

  public isClosed() {
    return !this.isOpened()
  }
  
  public open() {
    this.status = 'opened'
    return this.save()
  }
  
  public close() {
    this.status = 'closed'
    return this.save()
  }
  
  public static open(id: number) {
    return this.updateOrFail(id, {
      status: 'opened',
    })
  }
  
  public static close(id: number) {
    return this.updateOrFail(id, {
      status: 'closed',
    })
  }
}

//ContactSchema.index({ subject: 'text', message: 'text' });
