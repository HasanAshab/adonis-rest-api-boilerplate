import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import passwordStrategy from '#app/validation/rules/password/password_strategy_manager'


export function password(value: unknown, _, field: FieldContext) {
  if(typeof value !== 'string') return 
  
  const { strategy, name } = passwordStrategy.use(strategyName)
  if (await strategy.validate(value)) return

  return field.report(
    strategy.message.replace('{{ field }}', field.name),
    `password.${name}`,
    field
  )
}


export default vine.createRule(password)