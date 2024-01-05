import { merge } from 'lodash';
import { faker } from '@faker-js/faker';

export type StateCustomizer<Attributes> = (docState: Attributes) => Attributes;
export type ExternalCallback<DocType> = (
	docs: DocType[],
) => Promise<void> | void;

export default abstract class Factory<
	Attributes extends object = Record<string, any>,
	DocType extends Document,
> {
  
	/**
	 * Fake data generator
	 */
	protected faker = faker;

	/**
	 * Number of records to be generated
	 */
	private total = 1;

	/**
	 * Callbacks that customizes record's state
	 */
	private stateCustomizers: StateCustomizer<Attributes>[] = [];

	/**
	 * Callbacks to perform external async operations
	 * such as creating relational records.
	 */
	private externalCallbacks: ExternalCallback<DocType>[] = [];

	/**
	 * Create factory instance
	 */
	constructor(
		private Model: Model<DocType>,
		protected options: Record<string, unknown> = {},
	) {
		this.Model = Model;
		// this options will be available everywhere
		this.options = options;
	}

	/**
	 * Return the initial state of records
	 */
	abstract definition(): Attributes;

	/**
	 * Specify the number of records to be generated
	 */
	count(total: number) {
		this.total = total;
		return this;
	}

	/**
	 * Adds state customizer
	 */
	protected state(cb: StateCustomizer<Attributes>) {
		this.stateCustomizers.push(cb);
		return this;
	}

	/** 
	 * Adds external operations callback
	 */
	protected external(cb: ExternalCallback<DocType>) {
		this.externalCallbacks.push(cb);
		return this;
	}

	/**
	 * Generates all records raw data
	 */
	make(data?: Partial<Attributes>) {
		return this.total === 1
			? this.generateDocumentData(data)
			: Array.from({ length: this.total }, () =>
					this.generateDocumentData(data),
				);
	}

	/**
	 * Inserts all generated records into database
	 */
	async create(data: Partial<Attributes>) {
		const docsData = this.make(data);
		const method = this.total === 1 ? 'create' : 'createMany';
		const docs = await (this.Model as any)[method](docsData);
		await this.runExternalCallbacks(Array.isArray(docs) ? docs : [docs]);
		return docs;
	}

	/**
	 * Generates single record data
	 */
	private generateDocumentData(data?: Partial<Attributes>) {
		let recordData = this.customizeState(this.definition());
		if (data) {
			recordData = merge(recordData, data);
		}
		return recordData;
	}

	/**
	 * Runs all state customizers
	 */
	private customizeState(recordData: Attributes) {
		this.stateCustomizers.forEach((customizer) => {
			recordData = customizer(recordData);
		});
		return recordData;
	}

	/**
	 * Runs all external callbacks
	 */
	private runExternalCallbacks(docs: DocType[]) {
	  const promises = docs.map(doc => {
	    return this.externalCallbacks.map(cb => cb(doc));
	  });
	  
		return Promise.all(promises.flat());
	}
}
