import db from '@adonisjs/lucid/services/db'
import { join } from 'path'
import testUtils from '@adonisjs/core/services/test_utils'


export function fakeFilePathPath(name: string) {
  return join(__dirname, '../../tmp/test/', name)
}

export function refreshDatabase(group) {
  group.each.setup(() => testUtils.db().truncate())
}
