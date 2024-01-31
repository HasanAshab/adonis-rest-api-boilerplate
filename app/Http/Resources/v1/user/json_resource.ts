import AnonymousResourceCollection from './anonymous_resource_collection'

export default abstract class JsonResource {
  public static wrap = "data";
  
  constructor(protected readonly resource: Record<string, any>) {}
  
  public static make(resource: Record<string, any>) {
    if(this === JsonResource) {
      throw new Error('Cannot create an instance of an abstract class.')
    }

    return new (this as any)(resource);
  }
  
  public static collection(resources: Array<Record<string, any>>) {
    return new AnonymousResourceCollection(resources, this);
  }
  
  public abstract serialize(): Record<string, any>;
  
  public toJSON() {
    return {
      [this.constructor.wrap]: this.serialize()
    }
  }
  
  protected when(condition: boolean, value: unknown | (() => unknown)) {
    if(condition) {
      return typeof value === "function" 
        ? value()
        : value;
    }
  }
}