import ApiException from 'App/Exceptions/ApiException';
import { reduce } from 'lodash';


export default class ValidationException extends ApiException {
  public status = 422;
  
  constructor(public messages: Record<string, string>) {
    super();
    this.messages = messages;
  }
  
  public get payload() {
    return {
      errors: this.makeValidationErrors()
    }
  }

  
  private makeValidationErrors() {
    return reduce(this.messages, (result, message, field) => {
      result.push({ field, message });
      return result; 
    }, []); 
  }
}
