import { BaseModel } from '@adonisjs/lucid/orm'
import type { Request } from '@adonisjs/core/http'

declare module '@adonisjs/lucid/database' {
  interface DatabaseQueryBuilder {
    exists(): Promise<boolean>
  }
  
  interface DatabaseQueryBuilderContract {
    exists(): Promise<boolean>
  }
}

declare module '@adonisjs/lucid/orm' {
  interface ModelQueryBuilder {
    /**
     * Macro to add WHERE clauses for multiple columns with their respective values.
     * @param fields - The fields and their values to filter by.
     */
    whereEqual(fields: Record<string, any>): this

    /**
     * Macro to add a WHERE clause for the primary key of the model.
     * @param uid - The value of the primary key.
     */
    whereUid(uid: number): this

    /**
     * Macro to pluck a single column value from the resulting rows.
     * @param column - The name of the column to pluck.
     */
    pluck(column: string): Promise<any[]>

    last(): Promise<any>

    /**
     * Macro to find a record by its primary key.
     * @param uid - The value of the primary key.
     */
    find(uid: number): Promise<any | null>

    /**
     * Macro to find a record by its primary key or throw an exception if not found.
     * @param uid - The value of the primary key.
     */
    findOrFail(uid: number): Promise<any>

    /**
     * Macro to update records based on a query or throw an exception if no rows are affected.
     * @param data - The data to update.
     */
    updateOrFail(data: Record<string, any>): Promise<void>

    /**
     * Macro to delete records based on a query or throw an exception if no rows are affected.
     */
    deleteOrFail(): Promise<void>

    /**
     * Macro to check if any records match the query.
     */
    exists(): Promise<boolean>

    /**
     * Macro to exclude a specific model instance or UID from the query results.
     * @param modelOrId - The model instance or UID to exclude.
     */
    except(modelOrId: InstanceType<typeof BaseModel> | number | string): this

    /**
     * Macro to conditionally apply a query scope based on a boolean condition.
     * @param condition - The boolean condition determining whether to apply the query scope.
     * @param cb - The callback function defining the query scope.
     */
    when(condition: boolean, cb: (query: this) => this): this

    /**
     * Macro to count the number of records matching the query.
     * @param column - The column or columns to count.
     */
    getCount<T extends string | object>(
      column?: T
    ): Promise<T extends string ? number : Record<string, number>>

    /**
     * TS Query setted by search()
     */
    _tsQuery?: string

    /**
     * Macro to perform a full-text search using PostgreSQL's built-in text search functionality.
     * @param query - The search query.
     * @param vectorColumn - The name of the column containing the search vector.
     */
    search(query: string, vectorColumn?: string): this

    /**
     * Macro to calculate the rank of search results based on their relevance to the search query.
     * @param vectorColumn - The name of the column containing the search vector.
     */
    rank(vectorColumn?: string): this

    /**
     * Macro to paginate query results using request parameters.
     * @param request - The HTTP request object containing pagination parameters.
     */
    paginateUsing(request: Request): ReturnType<ModelQueryBuilder['paginate']>
  }
  interface ModelQueryBuilderContract {
    /**
     * Macro to add WHERE clauses for multiple columns with their respective values.
     * @param fields - The fields and their values to filter by.
     */
    whereEqual(fields: Record<string, any>): this

    /**
     * Macro to add a WHERE clause for the primary key of the model.
     * @param uid - The value of the primary key.
     */
    whereUid(uid: number): this

    /**
     * Macro to pluck a single column value from the resulting rows.
     * @param column - The name of the column to pluck.
     */
    pluck(column: string): Promise<any[]>

    last(): Promise<any>

    /**
     * Macro to find a record by its primary key.
     * @param uid - The value of the primary key.
     */
    find(uid: number): Promise<any | null>

    /**
     * Macro to find a record by its primary key or throw an exception if not found.
     * @param uid - The value of the primary key.
     */
    findOrFail(uid: number): Promise<any>

    /**
     * Macro to update records based on a query or throw an exception if no rows are affected.
     * @param data - The data to update.
     */
    updateOrFail(data: Record<string, any>): Promise<void>

    /**
     * Macro to delete records based on a query or throw an exception if no rows are affected.
     */
    deleteOrFail(): Promise<void>

    /**
     * Macro to check if any records match the query.
     */
    exists(): Promise<boolean>

    /**
     * Macro to exclude a specific model instance or UID from the query results.
     * @param modelOrId - The model instance or UID to exclude.
     */
    except(modelOrId: InstanceType<typeof BaseModel> | number | string): this

    /**
     * Macro to conditionally apply a query scope based on a boolean condition.
     * @param condition - The boolean condition determining whether to apply the query scope.
     * @param cb - The callback function defining the query scope.
     */
    when(condition: boolean, cb: (query: this) => this): this

    /**
     * Macro to count the number of records matching the query.
     * @param column - The column or columns to count.
     */
    getCount<T extends string | object>(
      column?: T
    ): Promise<T extends string ? number : { [K in keyof T]: number }>

    /**
     * TS Query setted by search()
     */
    _tsQuery?: string

    /**
     * Macro to perform a full-text search using PostgreSQL's built-in text search functionality.
     * @param query - The search query.
     * @param vectorColumn - The name of the column containing the search vector.
     */
    search(query: string, vectorColumn?: string): this

    /**
     * Macro to calculate the rank of search results based on their relevance to the search query.
     * @param vectorColumn - The name of the column containing the search vector.
     */
    rank(vectorColumn?: string): this

    /**
     * Macro to paginate query results using request parameters.
     * @param request - The HTTP request object containing pagination parameters.
     */
    paginateUsing(request: Request): ReturnType<ModelQueryBuilder['paginate']>
  }
  
}
