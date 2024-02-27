import logger from '@adonisjs/core/services/logger'
import { range } from 'lodash'
import { ExceptionHandler } from "@adonisjs/core/http";

/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class.
*/
export default class ExceptionHandler extends ExceptionHandler {
  ignoreStatuses = range(1, 499)

  constructor() {
    super(logger)
  }

  /*
	handle(error: any, ctx) {
	  if(error.code === 'E_UNAUTHORIZED_ACCESS') {
	    ctx.response.send({
    	  errors: [{
    	    code: error.code,
    	    message: error.message
    	  }]
	    })
	  }
	}
	*/
}
