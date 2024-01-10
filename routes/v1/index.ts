import Route from '@ioc:Adonis/Core/Route';
// import MediaController from "~/app/http/controllers/v1/MediaController";
//
// Router.get("/media/:rawMedia", MediaController).name("media.serve");
import AutoSwagger from "adonis-autoswagger";
import swagger from "Config/swagger";


// returns swagger in YAML
Route.get("swagger", async ({ response }) => {
  return response.sendOriginal(
    AutoSwagger.docs(Route.toJSON(), swagger)
  );
});

// Renders Swagger-UI and passes YAML-output of /swagger
Route.get("docs", async ({ response }) => {
  return response.sendOriginal(AutoSwagger.ui("/api/v1/swagger", swagger));
  return console.log(AutoSwagger.ui("/api/v1/swagger", swagger));
});