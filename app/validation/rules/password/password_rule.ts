import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import { PasswordStrategy } from '@ioc:Adonis/Core/Validator/Rules/Password'


export function password(value: unknown, _, field: FieldContext) {
  if(typeof value !== 'string') return 
  
  const { strategy, name } = PasswordStrategy.use(strategyName)
  if (await strategy.validate(value)) return

  return field.report(
    strategy.message.replace('{{ field }}', field.name),
    `password.${name}`,
    field
  )
}


export default vine.createRule(password)