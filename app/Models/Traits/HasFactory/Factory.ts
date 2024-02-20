import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { merge } from 'lodash'
import { faker } from '@faker-js/faker'

export type StateCustomizer<Attributes> = (state: Attributes) => Attributes

export type ExternalCallback<Model> = (model: Model) => Promise<void> | void

export default abstract class Factory<
  Model extends BaseModel,
  Attributes extends object = Record<string, any>,
> {
  /**
   * Fake data generator
   */
  protected faker = faker

  /**
   * Number of records to be generated
   */
  private total = 1

  /**
   * Callbacks that customizes record's state
   */
  private stateCustomizers: StateCustomizer<Attributes>[] = []

  /**
   * Callbacks to perform external async operations
   * such as creating relational records.
   */
  private externalCallbacks: ExternalCallback<Model>[] = []

  /**
   * Create factory instance
   */
  constructor(
    protected Model: typeof Model,
    protected options: Record<string, unknown> = {}
  ) {
    this.Model = Model
    // this options will be available everywhere
    this.options = options
  }

  static new(options = {}) {
    return new this(this.Model, options)
  }

  /**
   * Configure the factory.
   */
  public configure() {
    //
  }

  /**
   * Return the initial state of records
   */
  protected abstract definition(): Attributes

  /**
   * Specify the number of records to be generated
   */
  public count(total: number) {
    this.total = total
    return this
  }

  /**
   * Adds state customizer
   */
  public state(cb: StateCustomizer<Attributes>) {
    this.stateCustomizers.push(cb)
    return this
  }

  /**
   * Adds external operations callback
   */
  public external(cb: ExternalCallback<Model>) {
    this.externalCallbacks.push(cb)
    return this
  }

  /**
   * Generate all records stub data
   */
  public make(data?: Partial<Attributes>) {
    if (this.total === 1) {
      return this.generateData(data)
    }

    return Array.from({ length: this.total }, () => {
      return this.generateData(data)
    })
  }

  /**
   * generate and persists all records to database
   */
  public async create(data: Partial<Attributes>) {
    const stubModels = this.make(data)
    const records = Array.isArray(stubModels)
      ? await this.Model.createMany(stubModels)
      : await this.Model.create(stubModels)

    await this.runExternalCallbacks(records)
    return records
  }

  /**
   * Generates single record data
   */
  private generateData(data?: Partial<Attributes>) {
    let recordData = this.customizeState(this.definition())
    if (data) {
      recordData = merge(recordData, data)
    }
    return recordData
  }

  /**
   * Runs all state customizers
   */
  private customizeState(recordData: Attributes) {
    this.stateCustomizers.forEach((customizer) => {
      recordData = customizer(recordData)
    })
    return recordData
  }

  /**
   * Runs all external callbacks
   */
  private runExternalCallbacks(models: Model | Model[]) {
    if (!Array.isArray(models)) {
      return Promise.all(this.externalCallbacks.map((cb) => cb(models)))
    }

    const promises = models.map((model) => {
      return this.externalCallbacks.map((cb) => cb(model))
    })

    return Promise.all(promises.flat())
  }
}
