import Route from '@ioc:Adonis/Core/Route'
import AutoSwagger from 'adonis-autoswagger'
import swagger from 'Config/swagger'


Route.get('/', async ({ response }) =>
  response.sendOriginal(AutoSwagger.ui('/api/v1/docs/swagger', swagger))
)

Route.get('/swagger', async ({ response }) =>
  response.sendOriginal(await AutoSwagger.docs(Route.toJSON(), swagger))
)