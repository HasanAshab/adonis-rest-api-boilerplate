import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import passwordStrategy from '#app/validation/rules/password/password_strategy_manager'
import { PasswordStrategyName } from '#interfaces/validation/rules/password'

export async function password(
  value: unknown,
  strategyName: PasswordStrategyName,
  field: FieldContext
) {
  if (typeof value !== 'string') return

  const strategy = await passwordStrategy.use(strategyName)

  if (await strategy.validate(value)) return

  return field.report(
    strategy.message.replace('{{ field }}', field.name),
    `password.${strategyName}`,
    field
  )
}

export default vine.createRule(password)
