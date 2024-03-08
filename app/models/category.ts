import BaseModel from '#models/base_model'
import { DateTime } from 'luxon'
import { compose } from '@poppinss/utils/build/helpers'
import { column } from '@adonisjs/lucid/orm'
import { attachment, AttachmentContract } from '@ioc:adonis/addons/attachment_lite'
import HasFactory from '#models/traits/has_factory'

export default class Category extends compose(BaseModel, HasFactory) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @attachment()
  declare icon: AttachmentContract
}
