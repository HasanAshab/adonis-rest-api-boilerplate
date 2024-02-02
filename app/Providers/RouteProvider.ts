import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import fs from 'fs'
import path from 'path'

export default class RouteProvider {
  constructor(protected app: ApplicationContract) {}

  private registerRoutes() {
    const Route = this.app.container.use('Adonis/Core/Route')

    // Routes for V1
    Route.group(() => {
      Route.discover('routes/v1')
    })
      .namespace('App/Http/Controllers/V1')
      .prefix('/api/v1/')
      .as('v1')
  }

  private extendRoute() {
    const Application = this.app.container.use('Adonis/Core/Application')
    const Route = this.app.container.use('Adonis/Core/Route')

    Route.discover = function (base: string) {
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

            const routerPath = Application.makePath(itemPath.split('.')[0])

            const group = this.group(() => require(routerPath))
            if (!itemPath.endsWith('index.ts')) {
              group.prefix(itemPathEndpoint)
            }
          } else if (status.isDirectory()) {
            stack.push(itemPath)
          }
        }
      }
    }
    Route.RouteGroup.macro('invoke', function (route, method, params) {
      if (route instanceof Route.RouteGroup) {
        route.routes.forEach((child) => this.invoke(child, method, params))
        return
      }
      if (route instanceof Route.BriskRoute) {
        if (route.route) {
          if (method === 'as' && !route.route.name) {
            return
          }
          route.route[method](...params)
        }
        return
      }

      if (method === 'as' && !route.name) {
        return
      }
      route[method](...params)
    })
  }

  public boot() {
    this.extendRoute()
    this.registerRoutes()
  }
}
