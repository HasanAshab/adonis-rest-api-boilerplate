import Route from '@ioc:Adonis/Core/Route'


// Routes for V1
Route.group(() => {
  Route.discover('routes/v1')
})
.namespace('App/Http/Controllers/V1')
.prefix('/api/v1/')
.as('v1')