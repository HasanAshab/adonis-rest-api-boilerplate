import type { RouteGroup } from '@adonisjs/core/http'

declare module '@adonisjs/core/http' {
  export interface Router {
    discover(base: string, cb: (group: RouteGroup) => any): Promise<void>
  }
}
