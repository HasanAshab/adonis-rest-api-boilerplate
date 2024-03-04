import BaseModel from '#models/base_model'
import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import { column } from '@adonisjs/lucid/orm'
import { attachment, AttachmentContract } from '@ioc:adonis/addons/attachment_lite'
import HasFactory from '#models/traits/has_factory'

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
