import Logger from '@ioc:Adonis/Core/Logger';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler';
import { range } from 'lodash';

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
		super(Logger);
	}
	

	public handle(error: any, ctx: HttpContextContract) {
    if (error.code === 'E_TOO_MANY_REQUESTS') {
      return ctx.response.status(error.status).send('Too many requests');
    }

    return super.handle(error, ctx)
  }
}
