import type { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
import { DateTime } from 'luxon'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'


export default function HasTimestamps(Superclass: NormalizeConstructor < typeof BaseModel >) {
  return class extends Superclass {
    public static boot() {
      if(this.booted) return;
      super.boot();

      this.$addColumn('createdAt', 'datetime')
      this.$addColumn('updatedAt', 'datetime')

      this.before('save', user => {
        if (!user.createdAt) {
          user.createdAt = DateTime.local().toISO()
        }
        user.updatedAt = DateTime.local().toISO()
      });
    }

    public createdAt: DateTime;
    public updatedAt: DateTime;
  }
}