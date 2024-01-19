import { join } from 'path';
import { ClientConfig } from '@ioc:Adonis/Addons/Client';


export default class Client {
  private urlPaths = new Map<string, string>();
  
  constructor(private config: ClientConfig) {}
  
  public addPaths(paths: Record<string, string>) {
    for(const name in paths) {
      this.urlPaths.set(name, paths[name]);
    }
    return this;
  }
  
  public url(path = '') {
    return 'https://' + join(this.config.domain, path);
  }
  
  
  
  public makePath(name: string, data?: Record<string, any>) {
    let path = this.urlPaths.get(name);

    if (!path) {
      throw new Error(`No client URL path registered with name: ${name}.`);
    }
    
    if(data) {
      path = path.replace(/:(\w+)/g, (match, param) => {
        return encodeURIComponent(data[param]);
      });
    }
    return path;
  }
  
  public makeUrl(name: string, data?: Record<string, any>) {
    return this.url(
      this.makePath(name, data)
    );
  }
}