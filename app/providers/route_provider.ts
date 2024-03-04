import fs from 'fs'
import path from 'path'
import { ApplicationService } from "@adonisjs/core/types";

export default class RouteProvider {
  constructor(protected app: ApplicationService) {}

  private async extendRoute() {
    const { Router, Route } = await import('@adonisjs/core/http')
    const app = this.app

    Router.macro('discover', async function (base: string) {
      const stack = [base]
      while (stack.length > 0) {
        const currentPath = stack.pop()
        if (!currentPath) break
        const items = fs.readdirSync(currentPath)
        for (const item of items) {
          const itemPath = path.join(currentPath, item)
          const status = fs.statSync(itemPath)

          if (status.isFile()) {
            const itemPathEndpoint = itemPath.replace(base, '').split('.')[0].toLowerCase()
            const routerPath = '#' + itemPath.split('.')[0]
            
            const group = await this.group(() => import(routerPath))
            if (!itemPath.endsWith('index.ts')) {
              group.prefix(itemPathEndpoint)
            }
          } else if (status.isDirectory()) {
            stack.push(itemPath)
          }
        }
      }
    })
    Route.macro('as', function(name: string, prepend = false) {})

/*
    Route.macro('as', function(name: string, prepend = false) {
      if (prepend) {
        if (!this.#name) {
          return
        }
  
        this.#name = `${name}.${this.#name}`
        return this
      }

      this.#name = name
      return this
    })
 */
 }

  public async boot() {
    await this.extendRoute()
  }
}
