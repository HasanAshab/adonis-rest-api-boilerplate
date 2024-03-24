import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import db from '@adonisjs/lucid/services/db'
import { Checker } from '#interfaces/validation/rules/database'

export async function exists(
  value: unknown,
  referenceOrChecker: string | Checker,
  field: FieldContext
) {
  let rowExists: boolean
  if (typeof referenceOrChecker === 'function') {
    rowExists = await referenceOrChecker(value, field)
  } else {
    const [table, columnName] = referenceOrChecker.split('.')
    rowExists = await db.from(table).where(columnName, value).exists()
  }
  !rowExists && field.report(`${field.name} doesn't exists`, 'exists', field)
}

export default vine.createRule(exists)
