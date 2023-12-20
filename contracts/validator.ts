import { Model as MongooseModel } from 'mongoose';

declare module '@ioc:Adonis/Core/Validator' {
  type PasswordStrength = "strong" | "medium" | "weak";
  
  interface Rules {
    password(strength?: PasswordStrength): Rule
    unique(Model: string | MongooseModel, field: string): Rule
  }
}
