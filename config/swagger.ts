import path from "node:path";
import url from "node:url";

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + "/../", // for AdonisJS v6
  title: "Foo",
  version: "1.0.0",
  tagIndex: 2,
  snakeCase: true,
  ignore: ["/swagger", "/docs"],
  preferredPutPatch: "PUT",
  persistAuthorization: true,
  showFullPath: false
};