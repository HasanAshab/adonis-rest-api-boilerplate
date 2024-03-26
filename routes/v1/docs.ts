import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import { readdir, readFile } from 'node:fs/promises'


function setExampleToProperty(property) {
  if(property.type === 'object') {
    for(const prop of Object.values(property.properties)) {
      setExampleToProperty(prop)
    }
  }
  else if(property.type === 'array') {
    setExampleToProperty(property.items)
  }
  else if(property.example === null) {
    Object.defineProperty(property, 'example', {
      value: property.type,
      writable: false,
    });
  }
}

export default function docRoutes() {
  router.get('/', async ({ response }) =>
    response.sendOriginal(AutoSwagger.default.ui('/api/v1/docs/swagger', swagger))
  )

  router.get('/swagger', async ({ response }) => {
    const json = await AutoSwagger.default.json(router.toJSON(), swagger);
/*
    const fileNames = await readdir('docs/interfaces');
    for(const name of fileNames) {
      const data = await readFile('docs/interfaces/' + name, 'utf-8')
      const schemas = AutoSwagger.default.interfaceParser.parseInterfaces(data)
      json.components.schemas = {
        ...json.components.schemas,
        ...schemas
      }
    }
      for(const schema of Object.values(json.components.schemas)) {
        if(schema.properties) {
          for(const property of Object.values(schema.properties)) {
            setExampleToProperty(property)
          }
        }
      }
*/
    const yaml = AutoSwagger.default.jsonToYaml(json);
    response.sendOriginal(yaml)
  })
}
