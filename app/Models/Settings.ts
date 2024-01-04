import { DateTime } from 'luxon';
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm';

export default class Settings extends BaseModel {
	@column({ isPrimary: true })
	public id: number;

	@column()
	public userId: string;

	@column()
	public twoFactorAuth: {
		enabled: boolean;
		method: 'sms' | 'call' | 'app';
		secret: string | null;
	};

	@column()
	public notification: Record<string, Record<string, boolean>>;

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime;
}
