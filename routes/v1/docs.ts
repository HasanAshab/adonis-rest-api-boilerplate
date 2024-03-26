import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import { readdir, readFile } from 'node:fs/promises'


function setExampleToProperty(properties) {
  for(const property of Object.values(schema.properties)) {

  if(property.type === 'object') {
    return setExampleToProperty(property.properties)
  }
  
  else if(property.type === 'array') {
    return setExampleToProperty(property.items)
  }
  property.example = property.example ?? property.type
  }
}

export default function docRoutes() {
  router.get('/', async ({ response }) =>
    response.sendOriginal(AutoSwagger.default.ui('/api/v1/docs/swagger', swagger))
  )

  router.get('/swagger', async ({ response }) => {
    const json = await AutoSwagger.default.json(router.toJSON(), swagger);

    const fileNames = await readdir('docs/interfaces');
    for(const name of fileNames) {
      const data = await readFile('docs/interfaces/' + name, 'utf-8')
      const schemas = AutoSwagger.default.interfaceParser.parseInterfaces(data)
      for(const schema of Object.values(schemas)) {
        setExampleToProperty(schema.properties)
      }
      Object.assign(json.components.schemas, schemas)
    }
    
    
    const yaml = AutoSwagger.default.jsonToYaml(json);
    response.sendOriginal(yaml)
  })
}
