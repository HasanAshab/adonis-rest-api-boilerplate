import type { BaseModel } from '@ioc:Adonis/Lucid/Orm'

declare module '@ioc:Adonis/Lucid/Orm' {
  interface ModelQueryBuilderContract<
    Model extends LucidModel,
    Result = InstanceType<Model>
  > {
    whereFields(fields: Record<string, any>): this;
    exists(): Promise<boolean>;
    except(modelOrId: BaseModel | number): this;
  }
}
