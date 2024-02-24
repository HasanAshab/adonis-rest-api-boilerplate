import expect from 'expect'
import { toBeTrue, toBeFalse } from './matchers/to_be_matchers'

expect.extend({
  toBeTrue,
  toBeFalse
})
