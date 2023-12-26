import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DocumentNotFoundException extends Exception {
  status = 404;
  message = this.modelName + " Not Found.";
  
  constructor(public modelName = "Resource") {
    super(this.message, this.status);
    this.modelName = modelName;
  }
}