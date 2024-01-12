import Route from '@ioc:Adonis/Core/Route';
import AutoSwagger from "adonis-autoswagger";
import swagger from "Config/swagger";


// Router.get("/media/:rawMedia", MediaController).name("media.serve");

Route.get("swagger", async ({ response }) => {
  return response.sendOriginal(
    await AutoSwagger.docs(Route.toJSON(), swagger)
  );
});

Route.get("docs", async ({ response }) => {
  return response.sendOriginal(AutoSwagger.ui("/api/v1/swagger", swagger));
  return console.log(AutoSwagger.ui("/api/v1/swagger", swagger));
});