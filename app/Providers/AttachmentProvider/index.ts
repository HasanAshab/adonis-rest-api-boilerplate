import type { ApplicationContract } from '@ioc:Adonis/Core/Application';
import { Schema } from 'mongoose';

export default class AttachmentProvider {
	constructor(protected app: ApplicationContract) {}

	public register() {
		this.app.container.singleton('Adonis/Mongoose/Plugin/Attachable', () => {
			const Attachment = require('./Attachment').default;
			Schema.Types.Attachment = Attachment;

			return {
				...require('./Attachable'),
				AttachmentMeta: require('./AttachmentMeta').default,
				Attachment,
			};
		});
	}
}
