import Client from '@ioc:Adonis/Addons/Client'


Client.addPaths({
  'password.reset': '/password/reset/:id/:token'
  'auth.social.success': '/login/social/:provider/success/:token',
  'auth.social.finalStep': '/login/social/:provider/final-step/:externalId}/:token?fields=:fields'
});


console.log(
  Client.makeUrl('password.reset', {
    id: 23, 
    token: 'yduwjzdjeis'
    
  })
)