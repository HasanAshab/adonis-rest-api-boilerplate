import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import db from '@adonisjs/lucid/services/db'


export async function unique(value: unknown, column: string, field: FieldContext) {
  const [table, columnName] = column.split('.')
  const exists = await db.from(table).where(columnName, value).exists()
  
  if (!exists) return

  field.report(
    `${field.name} already exists`,
    'unique',
    field
  )
}


export default vine.createRule(unique)