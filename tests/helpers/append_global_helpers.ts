import db from '@adonisjs/lucid/services/db'
import { join } from 'path'
import { trace } from '#app/helpers'

globalThis.trace = trace

globalThis.fakeFilePath = function fakeFilePathPath(name: string) {
  return join(__dirname, '../../tmp/test/', name)
}

globalThis.refreshDatabase = function (group) {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })
}
