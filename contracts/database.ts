import type { BaseModel } from '@ioc:Adonis/Lucid/Orm'

declare module '@ioc:Adonis/Lucid/Orm' {
  interface ModelQueryBuilderContract<
    Model extends LucidModel,
    Result = InstanceType<Model>
  > {
    whereFields(fields: Record<string, any>): this;
    except(modelOrId: BaseModel | number): this;
  }
}
