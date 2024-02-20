import BaseModel from 'App/Models/BaseModel'
import { DateTime } from 'luxon'
import { compose } from '@poppinss/utils/build/helpers'
import { column } from '@ioc:Adonis/Lucid/Orm'
import HasFactory from 'App/Models/Traits/HasFactory'
//import Searchable from 'App/Models/Traits/Searchable';

export default class Contact extends compose(BaseModel, HasFactory) {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public subject: string

  @column()
  public message: string

  @column()
  public status: 'opened' | 'closed' = 'opened'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

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
