/*
|--------------------------------------------------------------------------
| Define HTTP rate limiters
|--------------------------------------------------------------------------
|
| The "Limiter.define" method callback receives an instance of the HTTP
| context you can use to customize the allowed requests and duration
| based upon the user of the request.
|
*/

import { Limiter } from '@adonisjs/limiter/build/services';

export const { httpLimiters } = Limiter.define('global', () => {
	return Limiter.allowRequests(100).every('1 min');
});




import User from 'App/Models/User';
import Settings from 'App/Models/Settings';
import Database from '@ioc:Adonis/Lucid/Database'

(async () => {
  //console.log(await User.factory().hasSettings().create())
  const s = await Settings.all()
	console.log(s)
	
/*	await Database.rawQuery(`
 UPDATE settings
 SET = jsonb_set('twoFactorAuth', '{enabled}', 'true')
 WHERE id = 1
`);*/

	//console.log(await Settings.find(1))
})()

