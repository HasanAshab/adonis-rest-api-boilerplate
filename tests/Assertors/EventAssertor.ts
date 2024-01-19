import Assertor from './Assertor';
import Event from '@ioc:Adonis/Core/Event';
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import expect from 'expect';
import { isEqual, isEqualWith } from 'lodash';


type FakeEmitter = ReturnType < Event['fake'] >;

export class EventAssertor extends Assertor {
  public fakeEmitter?: FakeEmitter;

  public fake(...args: Parameters < Event['fake'] >) {
    return this.fakeEmitter = Event.fake(...args);
  }

  private assertFaked(): asserts this is this & {
    fakeEmitter: FakeEmitter
  } {
    if (!this.fakeEmitter) {
      throw new Error('Event not faked. \nUse fake() before asserting events.');
    }
  }

  public isDispatched(eventName: string, data?: object) {
    this.assertFaked();
    return this.fakeEmitter.exists(event => {
      if (event.name !== eventName) {
        return false;
      }

      if (data && !isEqualWith(event.data, data, this.matchModels)) {
        return false;
      }
      return true;
    });
  }
  
  public isDispatchedContain(eventName: string, data: object) {
    this.assertFaked();
    return this.fakeEmitter.exists(event => {
      return event.name === eventName && containsObject(event.data, data);
    });
  }

  public assertDispatched(...args: Parameters < this['isDispatched'] >) {
    this.assert(() => {
      expect(this.isDispatched(...args)).toBe(true);
    });
  }
  
  public assertDispatchedContain(...args: Parameters < this['isDispatchedContain'] >) {
    this.assert(() => {
      expect(this.isDispatchedContain(...args)).toBe(true);
    });
  }

  public assertNotDispatched(eventName: string) {
    this.assert(() => {
      expect(this.isDispatched(eventName)).toBe(false);
    });
  }

  public assertNothingDispatched() {
    this.assert(() => {
      expect(this.fakeEmitter.events).toHaveLength(0)
    })
  }
  
  private matchModels(objValue: unknown, otherValue: unknown) {
    if(objValue instanceof BaseModel && otherValue instanceof BaseModel) {
    trace(objValue.toJSON(), otherValue.toJSON());

      return isEqual(objValue.toJSON(), otherValue.toJSON());
    }
  }
}

export default new EventAssertor;