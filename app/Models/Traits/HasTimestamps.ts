import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'


export default function HasTimestamps(Superclass: NormalizeConstructor<BaseModel>) {
  return class HasTimestampsModel extends Superclass {
    @column.dateTime({ autoCreate: true })
	  public createdAt: DateTime;

	  @column.dateTime({ autoCreate: true, autoUpdate: true })
	  public updatedAt: DateTime;
  }
}