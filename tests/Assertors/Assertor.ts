import expect from 'expect'

export default abstract class Assertor {
  public abstract fake(...args: any[]): any

  protected assertTrue(result: boolean, steps?: number) {
    try {
      expect(result).toBe(true)
    } catch (err) {
      throw this.resolveTestContext(err, steps)
    }
  }
  protected assertFalse(result: boolean, steps?: number) {
    try {
      expect(result).toBe(false)
    } catch (err) {
      throw this.resolveTestContext(err, steps)
    }
  }

  private resolveTestContext(err: Error, steps = 2) {
    err.stack = err.stack.split('\n').toSpliced(4, steps).join('\n')
    return err
  }
}
