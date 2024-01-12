import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
	protected tableName = 'users';

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id').primary();
			table.string('name', 35).nullable();
			table.string('username', 20).unique().nullable().index();
			table.string('email', 254).unique().notNullable().index();
			table.string('phone_number').nullable();
			table.enum('role', ['novice', 'user']).notNullable();
			table.boolean('verified').defaultTo(false);
			table.string('password').nullable();
			table.jsonb('recovery_codes').defaultTo([]);
			table.jsonb('social_id').defaultTo({});
			table.jsonb('profile').nullable();
			table.timestamp('created_at', { useTz: true });
			table.timestamp('updated_at', { useTz: true });
		});
	}

	public async down() {
		this.schema.dropTable(this.tableName);
	}
}
