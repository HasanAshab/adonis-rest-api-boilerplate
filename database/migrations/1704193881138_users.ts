import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
	protected tableName = 'users';

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id').primary();
			table.string('username', 255).unique().nullable();
			table.string('email', 255).unique();
			table.string('phone_number', 255).nullable();
			table.enum('role', ['novice', 'user']);
			table.boolean('verified').defaultTo(false);
			table.string('password', 180).nullable();
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
