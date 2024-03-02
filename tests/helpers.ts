import db from '@adonisjs/lucid/services/db'
import { join } from 'path'


export function fakeFilePathPath(name: string) {
  return join(__dirname, '../../tmp/test/', name)
}

export function refreshDatabase(group) {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })
}
