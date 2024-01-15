This: 

N: nafl -> 0

A: Forgot Pass API

E: + Fallback
* setup mailgun
* Mail Proposal
* inconsistent error response help
* SP how app pased behind the scene

Fallback: solve type, Eslint, model & migrate, Commands, 

T: app/listenners
I: Abstr listenner, Event class


you have to convert mongoose models to lucid model and migration. i will give you my mongoose models
one by one. before that here are some important factors to note:

1. plugin should be converted to this 'extend compose(BaseMode, ...Plugins)'
2. all plugins are located in './Traits/\*\*'. use it for imports
3. schema method -> lucid model method
4. schema virtual -> lucid model accesor (getter/setter)
5. schema statics -> lucid model static
6. No shortcuts, give full code of a single file at once

Technology: adonisjs v5, lucid: latest


Guys do you know the flow of **resetting password** in **REST API**?

What i did earlier is
1. unauthorized user hit /password/forgot with the email
2. An email sent to the email with a reset link (link of the frontend web with a reset token)
3. frontend hit /password/reset with the token and new password

That seems good but, isn't it breaks stateless nature?
As a client of a rest api can be anything else than web (mobile app for example)