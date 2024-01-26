import type { BaseModel } from '@ioc:Adonis/Lucid/Orm'

declare module '@ioc:Adonis/Lucid/Orm' {
  type QueryBuilderCallback<Query> = (query: Query) => Query;
  
  interface ModelQueryBuilderContract<
    Model extends LucidModel,
    Result = InstanceType<Model>
  > {
    when(condition: boolean, cb: QueryBuilderCallback<this>): this;
    whereFields(fields: Record<string, any>): this;
    exists(): Promise<boolean>;
    except(modelOrId: BaseModel | number): this;
  }
}
