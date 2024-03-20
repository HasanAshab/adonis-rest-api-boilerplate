import { column, afterDelete } from '@adonisjs/lucid/orm'
import BaseModel from '#models/base_model'
import db from '@adonisjs/lucid/services/db'

export default class LoginSession extends BaseModel  {
  @column({ isPrimary: true })
  declare id: number
  
  @column()
  declare userId: number
  
  @column()
  declare accessTokenId: number
  
  @column()
  declare loginDeviceId: string
  
  @afterDelete()
  static deleteAccessToken(loginSession: LoginSession) {
    return db
      .from('auth_access_tokens')
      .where('id', loginSession.accessTokenId)
      .delete()
  }
}