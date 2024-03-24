import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

export default function docRoutes() {
  router.get('/', async ({ response }) =>
    response.sendOriginal(AutoSwagger.default.ui('/api/v1/docs/swagger', swagger))
  )

  router.get('/swagger', async ({ response }) => {
    const json = await AutoSwagger.default.json(router.toJSON(), swagger);
    log(json.components.schemas)
    const yaml = AutoSwagger.default.jsonToYaml(json);

    response.sendOriginal(yaml)
  })
}
