import Assertor from './Assertor'
import Event from '@ioc:Adonis/Core/Event'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import expect from 'expect'
import { isEqual, isEqualWith } from 'lodash'

type FakeEmitter = ReturnType<Event['fake']>

export class EventAssertor extends Assertor {
  public fakeEmitter?: FakeEmitter

  private assertFaked(): asserts this is this & { fakeEmitter: FakeEmitter } {
    if (!this.fakeEmitter) {
      throw new Error('Event not faked. \nUse fake() before asserting events.')
    }
  }

  public fake(...args: Parameters<Event['fake']>) {
    return (this.fakeEmitter = Event.fake(...args))
  }

  public isDispatched(eventName: string, data?: object) {
    this.assertFaked()
    return this.fakeEmitter.exists((event) => {
      if (event.name !== eventName) {
        return false
      }
      if (data && !isEqual(event.data, data)) {
        return false
      }
      return true
    })
  }

  public isDispatchedContain(eventName: string, data: object) {
    this.assertFaked()
    return this.fakeEmitter.exists((event) => {
      return event.name === eventName && this.deepContainsObject(event.data, data)
    })
  }

  public assertDispatched(...args: Parameters<this['isDispatched']>) {
    this.assertTrue(this.isDispatched(...args))
  }

  public assertDispatchedContain(...args: Parameters<this['isDispatchedContain']>) {
    this.assertTrue(this.isDispatchedContain(...args))
  }

  public assertNotDispatched(eventName: string) {
    this.assertFalse(this.isDispatched(...args))
  }

  public assertNothingDispatched() {
    this.assertFalse(this.fakeEmitter.events.length)
  }

  private deepContainsObject(obj1: object, obj2: object) {
    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (typeof obj2[key] === 'object' && obj2[key] !== null) {
          if (!this.deepContainsObject(obj1[key], obj2[key])) {
            return false
          }
        } else if (obj1[key] !== obj2[key]) {
          return false
        }
      }
    }
    return true
  }
}

export default new EventAssertor()
