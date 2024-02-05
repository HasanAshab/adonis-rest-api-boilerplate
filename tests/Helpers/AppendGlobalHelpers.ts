import Database from '@ioc:Adonis/Lucid/Database'
import { join } from 'path'
import { trace } from 'App/helpers'

globalThis.trace = trace

globalThis.fakeFilePath = function fakeFilePathPath(name: string) {
  return join(__dirname, '../../tmp/test/', name)
}

globalThis.refreshDatabase = function (group) {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
}
