import app from '@adonisjs/core/services/app'
import { join } from 'path'
import testUtils from '@adonisjs/core/services/test_utils'


export function fakeFilePath(name: string) {
  return app.tmpPath(join('test/', name))
}

export function refreshDatabase(group) {
  group.each.setup(() => testUtils.db().truncate())
}
