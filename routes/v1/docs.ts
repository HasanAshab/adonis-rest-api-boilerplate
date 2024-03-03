import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'


router.get('/', async ({ response }) =>
  response.sendOriginal(AutoSwagger.ui('/api/v1/docs/swagger', swagger))
)

router.get('/swagger', async ({ response }) =>
  response.sendOriginal(await AutoSwagger.docs(router.toJSON(), swagger))
)