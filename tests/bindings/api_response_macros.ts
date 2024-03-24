import { ApiResponse } from '@japa/api-client'
import { get } from 'lodash-es'
import { toJSON } from '#app/helpers'

ApiResponse.macro('assertBodyContains', function (this: ApiResponse, subset: object) {
  this.ensureHasAssert()
  this.assert!.containsSubset(this.body(), toJSON(subset))
})

ApiResponse.macro(
  'assertBodyContainProperty',
  function (this: ApiResponse, property: string, subset: object) {
    this.ensureHasAssert()
    const recieved = get(this.body(), property)

    this.assert!.containsSubset(recieved, toJSON(subset))
  }
)

ApiResponse.macro(
  'assertBodyHaveProperty',
  function (this: ApiResponse, property: string, value?: unknown) {
    this.ensureHasAssert()
    const recieved = get(this.body(), property)
    this.assert!.isDefined(recieved)
    value && this.assert!.deepEqual(recieved, toJSON(value))
  }
)

ApiResponse.macro('assertBodyNotHaveProperty', function (this: ApiResponse, property: string) {
  this.ensureHasAssert()
  const recieved = get(this.body(), property)
  this.assert!.isUndefined(recieved)
})
