import app from '@adonisjs/core/services/app'
import { join } from 'node:path'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'


export function fakeFilePath(name: string) {
  return app.tmpPath(join('test/', name))
}

export function refreshDatabase(group) {
  group.each.setup(() => testUtils.db().truncate())
}

export function clearThrottle(group, stores?: string[]) {
  group.each.setup(() => {
    return () => limiter.clear(stores)
  })
}