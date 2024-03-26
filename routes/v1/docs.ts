import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
//import { readdir, readFile } from 'node:fs/promises'



// const paths = await AutoSwagger.default.getFiles('app/validation/validators')
// for(let path of paths) {
//   path = path
//     .replace('.ts', '')
//     .replace('#validators', pkgJson.imports['#validators/*'])
// 
// const validators = await import(path)
// 
// console.log(validators)
// }
// 
export default function docRoutes() {
 
  router.get('/', async ({ response }) =>
    response.sendOriginal(AutoSwagger.default.ui('/api/v1/docs/swagger', swagger))
  )

  router.get('/swagger', async ({ response }) => {
    const json = await AutoSwagger.default.json(router.toJSON(), swagger);
    const yaml = AutoSwagger.default.jsonToYaml(json);
    response.sendOriginal(yaml)
  })
}

