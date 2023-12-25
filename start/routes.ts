/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
| This file is dedicated for defining HTTP routes.
*/

import Route from '@ioc:Adonis/Core/Route'

import Env from '@ioc:Adonis/Core/Env'
import { hostname } from "os"

Route.makeFullUrl = function(...args) {
  const path = this.makeUrl(...args);
  return `https://${hostname()}:${Env.get('PORT')}${path}`;
}


Route.post("/api/v1/auth/register", "V1/AuthController.register");

Route.post("/api/v1/auth/login", "V1/AuthController.login");


Route.get("users/:id", "V1/AuthController.redirectToSocialLoginProvider").as("v1_users.show")


Route.get("auth/:provider", "V1/AuthController.redirectToSocialLoginProvider").where('provider', /google|facebook/);
Route.get("api/v1/auth/social/callback/:provider", "V1/AuthController.loginWithSocialProvider").where('provider', /google|facebook/);
