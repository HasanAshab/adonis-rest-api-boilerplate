import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
	protected tableName = 'users';

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id').primary();
			table.string('name', 35).nullable();
			table.string('username', 20).unique().nullable().index();
			table.string('email', 254).unique().nullable().index();
			table.string('phone_number').nullable();
			table.enum('role', ['novice', 'admin']).notNullable().defaultTo('novice');
			table.boolean('verified').notNullable();
			table.string('password').nullable();
			table.specificType('recovery_codes', 'text[]').nullable();
			table.string('social_provider').nullable();
			table.string('social_id').nullable();
			table.string('social_avatar').nullable();
			table.json('profile').nullable();
			table.timestamp('created_at', { useTz: true });
			table.timestamp('updated_at', { useTz: true });
		});
	}

	public async down() {
		this.schema.dropTable(this.tableName);
	}
}
