import Drive, { ContentHeaders } from '@ioc:Adonis/Core/Drive';
import { File } from '@adonisjs/bodyparser/build/src/Multipart/File';
import { cuid } from '@poppinss/utils/build/helpers';
import { join } from 'path';

export interface AttachmentMetaData {
	name: string;
	folder?: string;
	path?: string;
	disk?: string;
	file?: File;
}

export default class AttachmentMeta {
	static fromFile(file: File, folder?: string, disk?: string) {
		return new this({
			name: `${cuid()}.${file.extname}`,
			folder,
			disk,
			file,
		});
	}

	constructor(protected data: AttachmentMetaData) {
		this.data = data;
	}

	public get path() {
		if (!this.data.path) {
			this.resolvePath();
		}
		return this.data.path;
	}

	public get drive() {
		return Drive.use(this.data.drive);
	}

	public moveToDisk() {
		const { file, name, disk, folder = '' } = this.data;

		if (!file) {
			throw new Error(
				'attachment must have a assosiated file to save to storage.',
			);
		}

		return file.moveToDisk(folder, { name }, disk);
	}

	public delete() {
		return this.drive.delete(this.path);
	}

	public getUrl() {
		return this.drive.getUrl(this.path);
	}

	public getSignedUrl(
		options?: ContentHeaders & { expiresIn?: string | number },
	) {
		return this.drive.getSignedUrl(this.path, options);
	}

	public toJSON() {
		return {
			name: this.data.name,
			path: this.path,
		};
	}

	public toBSON() {
		return this.toJSON();
	}

	protected resolvePath() {
		this.data.path = this.data.folder
			? join(this.data.folder, this.data.name)
			: this.data.name;
	}
}
