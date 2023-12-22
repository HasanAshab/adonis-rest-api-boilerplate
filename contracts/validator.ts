import type PasswordStrategyManagerContract from "App/Services/PasswordStrategies/PasswordStrategyManager"
import { Model as MongooseModel } from 'mongoose';

declare module '@ioc:Adonis/Core/Validator' {
  type PasswordStrategy = "strong" | "medium" | "weak";
  
  interface Rules {
    slug(): Rule;
    password(strategy: PasswordStrategy): Rule;
    unique(Model: string | MongooseModel, field: string): Rule;
  }
}

declare module '@ioc:Adonis/Core/Validator/Rules/Password' {
  interface PasswordValidationStrategy {
    message: string;
    validate(value: unknown): boolean | Promise<boolean>;
  }
  
  const PasswordStrategyManager: PasswordStrategyManagerContract; 
}