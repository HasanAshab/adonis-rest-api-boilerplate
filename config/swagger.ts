export default {
  openapi: '3.0.0',
  path: `${__dirname}../`,
  title: 'Adonis Boilerplate',
  version: '1.0.0',
  tagIndex: 2,
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PUT', // if PUT/PATCH are provided for the same rout, prefer PUT
  common: {
    parameters: {}, // OpenAPI conform parameters that are commonly used
    headers: {}, // OpenAPI conform headers that are commonly used
  },
  persistAuthorization: true, // persist authorization between reloads on the swagger page
}
