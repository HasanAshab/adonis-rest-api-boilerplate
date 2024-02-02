import expect from 'expect'
import { isEqual } from 'lodash';

function testError(err1, err2) {
}

const cm = [testError]

export default function toThrowEqual(received: object, expected: object) {
  log(received instanceof Error, expected)
  log(this.equals(received, expected, cm))
  this.utils.printExpected()
  return {pass: false}
}
