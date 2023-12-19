import { Schema, Document } from "mongoose";
import Config from "Config";
import jwt from "jsonwebtoken";

export interface HasApiTokensDocument extends Document {
  tokenVersion: number;
  createToken(): string;
  createTemporaryToken(): string;
}

export default (schema: Schema) => {
  schema.add({
    tokenVersion: {
      type: Number,
      default: 0
    },
  });

  schema.methods.createToken = function () {
    return jwt.sign(
      { version: this.tokenVersion },
      Config.get<string>("app.key"),
      { 
        expiresIn: Config.get("jwt.expiration"),
        subject: this._id.toString(),
        issuer: Config.get("app.name"),
        audience: "auth"
      }
    );
  };
};