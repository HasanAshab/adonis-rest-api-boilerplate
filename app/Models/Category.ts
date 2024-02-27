import BaseModel from '#app/Models/BaseModel'
import { DateTime } from 'luxon'
import { compose } from '@poppinss/utils/build/helpers'
import { column } from '@adonisjs/lucid/orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import HasFactory from '#app/Models/Traits/HasFactory'

export default class Category extends compose(BaseModel, HasFactory) {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public slug: string

  @attachment()
  public icon: AttachmentContract
}
