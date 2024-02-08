import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'contacts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('email', 254).notNullable()
      table.string('subject').notNullable().index()
      table.string('message').notNullable()
      table.enum('status', ['opened', 'closed']).defaultTo('opened')
      table.timestamp('created_at', { useTz: true })
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE ${this.tableName}
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (to_tsvector('english', coalesce(subject, '') || ' ' || coalesce(message, ''))) STORED;
      `)

      await db.rawQuery(`
        CREATE INDEX textsearch_idx ON ${this.tableName} USING GIN (search_vector);
      `)
    })
  }

  public async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}
