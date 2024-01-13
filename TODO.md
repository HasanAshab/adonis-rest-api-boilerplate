This: 
. Adonis swagger
1. TFA

N: nafl -> 2

E: SP how app pased behind the scene

Fallback: solve type, Eslint, model & migrate, Commands, PR stub cust
T: standard Exception res format
I: Abstr listenner, Event class
T: provide Factory
T: Api doc
T: test phonenumberless user 2fa with app method


you have to convert mongoose models to lucid model and migration. i will give you my mongoose models
one by one. before that here are some important factors to note:

1. plugin should be converted to this 'extend compose(BaseMode, ...Plugins)'
2. all plugins are located in './Traits/\*\*'. use it for imports
3. schema method -> lucid model method
4. schema virtual -> lucid model accesor (getter/setter)
5. schema statics -> lucid model static
6. No shortcuts, give full code of a single file at once

Technology: adonisjs v5, lucid: latest



Brothers, help me for implementation flow of **Two Factor Auth** in rest api.

My User model has a field of 'phoneNumber' which is nullable (not required).
When a user wants to enable Two Factor Auth, they must have to setup phoneNumber before.
But what is the best way to inform the client that the requested user need to be setup phoneNumber 