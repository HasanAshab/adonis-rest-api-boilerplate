import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'


export function slug(value: unknown, _, field: FieldContext) {
  const slugPattern = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/
  if (typeof value !== 'string' || slugPattern.test(value)) return

  field.report(
    `${field.name} must be a valid slug`,
    'slug',
    field
  )
}


export default vine.createRule(slug)