import BaseModel from 'App/Models/BaseModel'
import { column } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@poppinss/utils/build/helpers'
import HasFactory from 'App/Models/Traits/HasFactory'


export default class NotificationType extends compose(BaseModel, HasFactory) {
  @column({ isPrimary: true })
  public type: string 
  
  @column()
  public name: string
  
  @column()
  public groupName: string 
  
  @column()
  public description: string
}
