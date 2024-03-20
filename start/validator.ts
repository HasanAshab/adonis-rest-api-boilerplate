import { VineString } from '@vinejs/vine'
import { PasswordStrategyName } from '#interfaces/validation/rules/password'
import passwordRule from '#app/validation/rules/password/password_rule'
import slugRule from '#app/validation/rules/slug_rule'
import uniqueRule from '#app/validation/rules/unique_rule'
import existsRule from '#app/validation/rules/exists_rule'

VineString.macro('unique', function (this: VineString, column: string) {
  return this.use(uniqueRule(column))
})

VineString.macro('exists', function (this: VineString, column: string) {
  return this.use(existsRule(column))
})

VineString.macro('password', function (this: VineString, strategyName: PasswordStrategyName) {
  return this.use(passwordRule(strategyName))
})

VineString.macro('slug', function (this: VineString) {
  return this.use(slugRule())
})
