import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import db from '@adonisjs/lucid/services/db'


export async function exists(value: unknown, reference: string, field: FieldContext) {
  const [table, columnName] = reference.split('.')
  const exists = await db.from(table).where(columnName, value).exists()
  
  if (exists) return

  field.report(
    `${field.name} doesn't exists`,
    'exists',
    field
  )
}


export default vine.createRule(exists)