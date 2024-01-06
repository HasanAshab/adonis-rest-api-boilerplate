import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { DateTime } from 'luxon'


export default function HasTimestamps(Superclass: NormalizeConstructor<typeof BaseModel>) {
  return class extends Superclass {
    @column.dateTime({ autoCreate: true })
	  public createdAt: DateTime;

	  @column.dateTime({ autoCreate: true, autoUpdate: true })
	  public updatedAt: DateTime;
  }
}