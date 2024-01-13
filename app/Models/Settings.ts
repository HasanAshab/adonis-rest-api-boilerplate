import { DateTime } from 'luxon';
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm';
//import type AuthConfig from 'Config/auth';

export interface TwoFactorAuthSettings {
  enabled: boolean;
  method: 'sms' | 'call' | 'app';
  secret: string | null;
};


export default class Settings extends BaseModel {
  @column({
    isPrimary: true
  })
  public id: number;

  @column()
  public userId: string;

  @column.json()
  public twoFactorAuth: TwoFactorAuthSettings = {
		enabled: false,
		method: 'sms',
		secret: null
  };

  @column.json()
  public notification: Record < string, Record < string, boolean>>;

  @column.dateTime({
    autoCreate: true
  })
  public createdAt: DateTime;

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true
  })
  public updatedAt: DateTime;
}