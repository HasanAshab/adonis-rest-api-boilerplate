import { ApiResponse } from '@japa/api-client'
import { get } from 'lodash'
import { toJSON } from 'App/helpers'

ApiResponse.macro('assertBodyContains', function (subset: object) {
  this.ensureHasAssert()
  this.assert.containsSubset(this.body(), toJSON(subset))
})

ApiResponse.macro('assertBodyHaveProperty', function (property: string, value?: unknown) {
  this.ensureHasAssert()
  const recieved = get(this.body(), property)
  this.assert.isDefined(recieved)
  value && this.assert.deepEqual(recieved, value)
})

ApiResponse.macro('assertBodyNotHaveProperty', function (property: string) {
  this.ensureHasAssert()
  const recieved = get(this.body(), property)
  this.assert.isUndefined(recieved)
})
