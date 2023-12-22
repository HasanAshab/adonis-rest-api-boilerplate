/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
| This file is dedicated for defining HTTP routes.
*/

import Route from '@ioc:Adonis/Core/Route'


Route.post("auth", "V1/AuthController.register");


Route.get("auth/:provider", "V1/AuthController.redirectToSocialLoginProvider").where('provider', /google|facebook/);
