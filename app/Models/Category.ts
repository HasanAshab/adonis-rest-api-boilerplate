import { DateTime } from 'luxon'
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class Category extends BaseModel {
 @column({ isPrimary: true })
 public id: number

 @column()
 public name: string

 @column()
 public slug: string

 @column()
 public icon: string

 @column.dateTime({ autoCreate: true })
 public createdAt: DateTime

 @column.dateTime({ autoCreate: true, autoUpdate: true })
 public updatedAt: DateTime
}


CategorySchema.plugin(HasFactory);
CategorySchema.plugin(Attachable);
