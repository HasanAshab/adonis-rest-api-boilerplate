import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'


/*
Run this suits:
node ace test functional --files="v1/auth/social.spec.ts"
*/
test.group('Auth / Social', (group) => {
  let user: User

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await User.factory().create()
  })
  
})