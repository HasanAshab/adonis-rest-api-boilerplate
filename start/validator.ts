import { VineString } from '@vinejs/vine'
import { PasswordStrategy } from '@ioc:Adonis/Core/Validator/Rules/Password'


VineString.macro('password', async (value, [strategyName], options) => {
    const { strategy, name } = PasswordStrategy.use(strategyName)

    if (await strategy.validate(value)) return

    return options.errorReporter.report(
      options.pointer,
      `password.${name}`,
      strategy.message.replace('{{ field }}', options.field),
      strategy.message,
      options.arrayExpressionPointer
    )
  },
  () => ({ async: true })
)

VineString.macro('slug', (value, _, options) => {
  const slugPattern = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/
  if (slugPattern.test(value)) return

  return options.errorReporter.report(
    options.pointer,
    'slug',
    `${options.field} must be a valid slug`,
    options.arrayExpressionPointer
  )
})

