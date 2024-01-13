import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
	protected tableName = 'settings';

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id').primary();
			
			table
				.integer('user_id')
				.unsigned()
				.index()
				.references('users.id')
				.onDelete('CASCADE');
			table.jsonb('two_factor_auth').notNullable();
			table.jsonb('notification').notNullable();
			table.timestamp('created_at', { useTz: true }).notNullable();
			table.timestamp('updated_at', { useTz: true }).notNullable();
		});
	}

	public async down() {
		this.schema.dropTable(this.tableName);
	}
}
