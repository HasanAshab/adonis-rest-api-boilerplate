import vine, { VineString } from '@vinejs/vine'
import passwordRule from '#app/http/validators/rules/password_rule'
import slugRule from '#app/http/validators/rules/slug_rule'
import uniqueRule from '#app/http/validators/rules/unique_rule'
import existsRule from '#app/http/validators/rules/exists_rule'


VineString.macro('unique', function(column: string) {
  return this.use(uniqueRule(column))
})

VineString.macro('exists', function(column: string) {
  return this.use(uniqueRule(column))
})


VineString.macro('password', function(strategyName: string) {
  return this.use(passwordRule(strategyName))
})

VineString.macro('slug', function() {
  return this.use(slugRule())
})
