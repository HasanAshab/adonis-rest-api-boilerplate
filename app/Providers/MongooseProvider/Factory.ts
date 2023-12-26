import { Model, Document } from "mongoose";
import { merge } from "lodash";
import { faker } from "@faker-js/faker";

export type StateCustomizer<IDoc> = (docState: IDoc) => IDoc;
export type ExternalCallback<DocType> = (docs: DocType[]) => Promise<void> | void;

export default abstract class Factory<IDoc extends object, DocType extends Document> {
 /**
  * Fake data generator
  */
  protected faker = faker;
  
  /**
   * Number of documents to be generated
  */
  private total = 1;

  /**
   * Callbacks that customizes document's state
  */
  private stateCustomizers: StateCustomizer<IDoc>[] = [];
 
  /**
   * Callbacks to perform external async operations
   * such as creating relational documents.
  */
  private externalCallbacks: ExternalCallback<DocType>[] = [];
  
  /**
   * Create factory instance
  */
  constructor(private Model: Model<DocType>, protected options: Record<string, unknown> = {}) {
    this.Model = Model;
    // this options will be available everywhere
    this.options = options;
  }
  
  /**
   * Return the initial state of documents
  */
  abstract definition(): IDoc;
  
  /**
   * Specify the number of documents to be generated
  */
  count(total: number) {
    this.total = total;
    return this;
  }
  
  /**
   * Adds state customizer
  */
  protected state(cb: StateCustomizer<IDoc>) {
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
   * Generates all documents raw data
  */
  make(data?: Partial<IDoc>) {
    return this.total === 1
      ? this.generateDocumentData(data)
      : Array.from({ length: this.total }, () => this.generateDocumentData(data));
  }
  
  /**
   * Inserts all generated documents into database
  */
  async create(data: Partial<IDoc>) {
    const docsData = this.make(data);
    const method = this.total === 1 
      ? "create"
      : "insertMany";
    const docs = await (this.Model as any)[method](docsData);
    await this.runExternalCallbacks(Array.isArray(docs) ? docs : [docs]);
    return docs;
  }
  
  /**
   * Generates single document data 
  */
  private generateDocumentData(data?: Partial<IDoc>) {
    let docData = this.customizeState(this.definition());
    if(data) {
      docData = merge(docData, data);
    }
    return docData;
  }
  
  /**
   * Runs all state customizers
  */
  private customizeState(docData: IDoc) {
    this.stateCustomizers.forEach(customizer => {
      docData = customizer(docData)
    });
    return docData;
  }
  
  /**
   * Runs all external callbacks
  */
  private runExternalCallbacks(docs: DocType[]) {
    const promises = this.externalCallbacks.map(cb => cb(docs));
    return Promise.all(promises);
  }
}