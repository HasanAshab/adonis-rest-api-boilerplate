export default {}
/*
import { model, Schema, Document, Model } from "mongoose";
import crypto from "crypto";
import InvalidTokenException from "App/Exceptions/InvalidTokenException";

const TokenSchema = new Schema<TokenDocument, TokenModel>({
  key: {
    index: true,
    required: true,
    type: String
  },
  type: {
    index: true,
    required: true,
    type: String
  },
  data: {
    type: Object,
    default: null
  },
  secret: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  expiresAt: {
    type: Date,
    expires: 0,
    default: null
  }
});

TokenSchema.static("isValid", async function(this: TokenModel, key: string, type: string, secret: string): Promise<boolean> {
  const token = await this.findOneAndDelete({ key, type, secret });
  return !!token;
});

TokenSchema.static("verify", async function<T extends object | null = null>(this: TokenModel, key: string, type: string, secret: string): Promise<T> {
  const token = await this.findOneAndDelete({ key, type, secret });
  if(!token) {
    throw new InvalidTokenException();
  }
  return token.data as T;
});

export interface IToken {
  key: string;
  data: object | null;
  type: string;
  secret: string;
  expiresAt: Date | null;
} 

export interface TokenDocument extends Document, IToken {};

interface TokenModel extends Model<TokenDocument> {
  isValid(key: string, type: string, secret: string): Promise<boolean>;
  verify<T extends object | null = null>(key: string, type: string, secret: string): Promise<T>;
};


export default model<TokenDocument, TokenModel>("Token", TokenSchema);
*/