import { join } from 'node:path'
import { ClientConfig } from '@ioc:adonis/addons/client'

export default class Client {
  private urlPaths = new Map<string, string>()

  constructor(private config: ClientConfig) {}

  addPaths(paths: Record<string, string>) {
    for (const name in paths) {
      this.urlPaths.set(name, paths[name])
    }
    return this
  }

  url(path = '') {
    return 'https://' + join(this.config.domain, path)
  }

  makePath(name: string, data?: Record<string, any>) {
    let path = this.urlPaths.get(name)

    if (!path) {
      throw new Error(`No client URL path registered with name: ${name}.`)
    }

    if (data) {
      path = path.replace(/:(\w+)/g, (match, param) => {
        return encodeURIComponent(data[param])
      })
    }
    return path
  }

  makeUrl(name: string, data?: Record<string, any>) {
    return this.url(this.makePath(name, data))
  }
}
