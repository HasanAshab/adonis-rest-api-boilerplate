import { model, Schema, Document, Model } from 'mongoose';
import HasFactory, { HasFactoryModel } from 'App/Plugins/HasFactory';

const MediaSchema = new Schema<MediaDocument>({
	mediableId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	mediableType: {
		type: String,
		required: true,
	},
	tag: {
		type: String,
		required: true,
	},
	path: {
		type: String,
		required: true,
	},
	visibility: {
		type: String,
		enum: ['public', 'private'],
		default: 'public',
	},
});

MediaSchema.plugin(HasFactory);

export interface IMedia {
	mediableId: Schema.Types.ObjectId;
	mediableType: string;
	tag: string;
	path: string;
	visibility: 'public' | 'private';
}

export interface MediaDocument extends Document, IMedia {}
interface MediaModel extends Model<MediaDocument> {}

export default model<MediaDocument, MediaModel>('Media', MediaSchema);
