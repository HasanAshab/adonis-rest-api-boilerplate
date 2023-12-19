import { Schema, Document } from "mongoose";
import Config from "Config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import EmailVerificationNotification from "~/app/notifications/EmailVerificationNotification";
import ForgotPasswordNotification from "~/app/notifications/ForgotPasswordNotification";

export interface AuthenticatableDocument extends Document {
  attempt(password: string): Promise<boolean>;
  setPassword(password: string): Promise<void>;
  sendVerificationNotification(version: string): Promise<void>;
  sendResetPasswordNotification(): Promise<void>;
  generateRecoveryCodes(count?: number): Promise<string[]>;
  verifyRecoveryCode(code: string): Promise<boolean>;
}

export default (schema: Schema) => {
  schema.methods.attempt = function (password: string) {
    return bcrypt.compare(password, this.password);
  }

  schema.methods.setPassword = async function (password: string) {
    this.password = await bcrypt.hash(password, Config.get<number>("bcrypt.rounds"));
  }
  
  schema.methods.sendVerificationNotification = async function(version: string) {
    await this.notify(new EmailVerificationNotification({ version }));
  }
  
  schema.methods.sendResetPasswordNotification = async function() {
    await this.notify(new ForgotPasswordNotification);
  }

  schema.methods.generateRecoveryCodes = async function(count = 10) {
    const rawCodes: string[] = [];
    const promises: Promise<void>[] = [];
    for (let i = 0; i < count; i++) {
      const generateCode = async () => {
        const code = crypto.randomBytes(8).toString('hex');
        rawCodes.push(code);
        this.recoveryCodes = await bcrypt.hash(code, Config.get("bcrypt.rounds"));
      }
      promises.push(generateCode());
    }
    await Promise.all(promises);
    await this.save();
    return rawCodes;
  }
  
  schema.methods.verifyRecoveryCode = async function(code: string) {
    for (let i = 0; i < this.recoveryCodes.length; i++) {
      const hashedCode = this.recoveryCodes[i];
      if (await bcrypt.compare(code, hashedCode)) {
        this.recoveryCodes.splice(i, 1);
        await this.save();
        return true;
      }
    }
    return false;
  };

};
