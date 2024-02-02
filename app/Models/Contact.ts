import BaseModel from 'App/Models/BaseModel'
import { DateTime } from 'luxon'
import { compose } from '@poppinss/utils/build/helpers'
import { column } from '@ioc:Adonis/Lucid/Orm'
import HasFactory from 'App/Models/Traits/HasFactory'
//import Searchable from 'App/Models/Traits/Searchable';

export default class Contact extends compose(BaseModel, HasFactory) {
  //, Searchable) {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public subject: string

  @column()
  public message: string

  @column()
  public status: 'opened' | 'closed'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}

//ContactSchema.index({ subject: 'text', message: 'text' });
