import { DateTime } from 'luxon';
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm';
//import { json } from '@ioc:Adonis/Lucid/Orm';


column.json = function(options) {
  return function decorateAsJson(target, property) {
    const Model = target.constructor;
    Model.boot();
    const normalizedOptions = Object.assign({
     // prepare: JSON.stringify,
      consume: JSON.parse,
    }, options);
    Model.$addColumn(property, normalizedOptions);
  }
}

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
  public twoFactorAuth: TwoFactorAuthSettings;

  @column()
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