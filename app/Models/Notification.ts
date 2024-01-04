import {
	model,
	Model,
	QueryWithHelpers,
	HydratedDocument,
	Schema,
	Document,
} from 'mongoose';
import HasFactory, { HasFactoryModel } from 'App/Plugins/HasFactory';
//import DocumentNotFoundException from "App/Exceptions/DocumentNotFoundException";

const NotificationSchema = new Schema<
	NotificationDocument,
	Model<NotificationDocument>,
	{},
	NotificationQueryHelpers
>(
	{
		userId: {
			required: true,
			ref: 'User',
			type: Schema.Types.ObjectId,
			index: true,
			cascade: true,
		},
		type: {
			required: true,
			type: String,
		},
		data: {
			required: true,
			type: Schema.Types.Mixed,
		},
		readAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.methods.markAsRead = async function () {
	await this.update({ readAt: new Date() });
};

(NotificationSchema.query.markAsRead = async function (
	this: QueryWithHelpers<any, NotificationDocument, NotificationQueryHelpers>,
) {
	const { modifiedCount } = await this.updateOne(this.getFilter(), {
		readAt: new Date(),
	});
	return modifiedCount === 1;
}),
	(NotificationSchema.query.markAsReadOrFail = async function () {
		if (!(await this.markAsRead())) throw new DocumentNotFoundException();
	});

NotificationSchema.plugin(HasFactory);

export interface INotification {
	userId: Schema.Types.ObjectId;
	type: string;
	data: unknown[] | object;
	readAt: Date | null;
}

export interface NotificationDocument extends Document, INotification {
	markAsRead(): Promise<void>;
}

export interface NotificationQueryHelpers {
	markAsRead(): Promise<boolean>;
	markAsReadOrFail(): Promise<void>;
}

interface NotificationModel
	extends Model<NotificationDocument, NotificationQueryHelpers>,
		HasFactoryModel {}

export default model<NotificationDocument, NotificationModel>(
	'Notification',
	NotificationSchema,
);
