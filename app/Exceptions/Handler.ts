import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { range } from 'lodash'

/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class.
*/
export default class ExceptionHandler extends HttpExceptionHandler {
  ignoreStatuses = range(1, 499);
  
  constructor() {
    super(Logger)
  }
}