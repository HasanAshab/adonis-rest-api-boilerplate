export default abstract class Assertor {
  public abstract fake(...args: any[]): any;
  
  protected assert(cb: (() => void), steps = 3) {
    try {
      cb();
    }
    catch(e) {
      e.stack = e.stack.split('\n').toSpliced(4, steps).join('\n');
      throw e
    }
  }

}