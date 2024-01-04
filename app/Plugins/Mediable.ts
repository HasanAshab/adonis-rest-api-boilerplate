import Route from '@ioc:Adonis/Core/Route';
import Drive from '@ioc:Adonis/Core/Drive';
import Media, { IMedia, MediaDocument } from 'App/Models/Media';
import { join } from 'path';
import { Schema, Document } from 'mongoose';
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';

export interface ReplaceOptions {
	storagePath?: string;
	visibility?: 'public' | 'private';
}

export interface MediableDocument extends Document {
	media(): {
		then(
			onFulfill?: ((value: MediaDocument[]) => void) | undefined,
			onReject?: ((reason: any) => void) | undefined,
		): Promise<MediaDocument[]>;
		withTag(tag: string): {
			then(
				onFulfill?: ((value: MediaDocument[]) => void) | undefined,
				onReject?: ((reason: any) => void) | undefined,
			): Promise<MediaDocument[]>;
			first(
				onFulfill?: ((value: MediaDocument | null) => void) | undefined,
				onReject?: ((reason: any) => void) | undefined,
			): Promise<MediaDocument | null>;
			attach(
				file: MultipartFileContract,
				storagePath?: string,
			): {
				then(
					onFulfill?: ((value: MediaDocument) => void) | undefined,
					onReject?: ((reason: any) => void) | undefined,
				);
				asPrivate(): Promise<MediaDocument>;
			};
			replaceBy(
				file: MultipartFileContract,
				options?: ReplaceOptions,
			): Promise<MediableDocument>;
			detach(): Promise<any>;
		};
	};
}

export default (schema: Schema) => {
	schema.methods.media = function (this: MediableDocument) {
		const metadata = {
			mediableId: this._id,
			mediableType: this.constructor.modelName,
		};

		const getMedia = (onFulfill, onReject) =>
			Media.find(metadata).then(onFulfill, onReject);

		const withTag = (tag: string) => {
			const filter = { tag, ...metadata };

			const getMediaByTag = (onFulfill, onReject) =>
				Media.find(filter).then(onFulfill, onReject);

			const first = () => Media.findOne(filter);

			const attach = (file: MultipartFileContract, storagePath = '') => {
				let visibility = 'public';
				let storeRefIn = null;
				let storeLinkIn = null;

				const attachMedia = (onFulfill, onReject) => {
					file.moveToDisk(storagePath).then(() => {
						const path = join(storagePath, file.fileName);

						Media.create({ path, visibility, ...filter })
							.catch(onReject)
							.then((media) => {
								if (storeRefIn) {
									this[storeRefIn] = media._id;
								}
								/*
              if(storeLinkIn) {
                if (visibility === "private") {
                  this[storeLinkIn] = Route.makeSignedUrl("v1_media.serve", [media._id]);
                } 
                else {
                  this[storeLinkIn] = Route.makeUrl("v1_media.serve", [media._id]);
                }
              }
              */
								onFulfill(media);
							});
					});
				};

				function asPrivate() {
					visibility = 'private';
					return this;
				}

				function storeRef(field = tag) {
					storeRefIn = field;
					return this;
				}

				function storeLink(field = tag) {
					storeLinkIn = field;
					return this;
				}

				return { then: attachMedia, asPrivate, storeRef, storeLink };
			};

			const replaceBy = async (file: MultipartFileContract) => {
				const media = await Media.findOneOrFail(filter);
				await Drive.put(media.path, file.data);
			};

			const detach = async () => {
				const media = await Media.find(filter);
				const paths = media.map((item) => item.path);
				await Drive.delete(paths);
				return Media.deleteMany(filter);
			};

			return { then: getMediaByTag, first, attach, replaceBy, detach };
		};

		return { then: getMedia, withTag };
	};
};
