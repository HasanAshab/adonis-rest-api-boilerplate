import { Schema, Document } from "mongoose";
import Config from "@ioc:Adonis/Core/Config";
import jwt from "jsonwebtoken";

export interface HasApiTokensDocument extends Document {
  tokenVersion: number;
  createToken(): string;
}

export default (schema: Schema) => {
  schema.add({
    tokenVersion: {
      type: Number,
      default: 0
    }
  });

  schema.methods.createToken = function () {
    const expiration = Config.get("jwt.expiration");
    const token = jwt.sign(
      { version: this.tokenVersion },
      Config.get("app.appKey"),
      { 
        expiresIn: expiration,
        subject: this._id.toString(),
        issuer: Config.get("app.name"),
        audience: "auth"
      }
    );
    
    return { token, expiration };
  };
};