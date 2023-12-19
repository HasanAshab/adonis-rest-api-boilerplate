import { model, Schema, Document, Model } from "mongoose";
import notificationConfig from "~/config/notification";

const { channels, types } = notificationConfig;

const notificationDefaults = channels.reduce((defaults: Record<string, any>, channel) => {
  defaults[channel] = {
    type: Boolean,
    default: true
  }
  return defaults;
}, {});

export const twoFactorAuthMethods = ["sms", "call", "app"] as const;

const SettingsSchema = new Schema<SettingsDocument>({
  userId: {
    required: true,
    ref: "User",
    type: Schema.Types.ObjectId,
    cascade: true,
    unique: true
  },
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false,
    },
    method: {
      type: String,
      enum: twoFactorAuthMethods,
      default: "sms",
    },
    secret: {
      type: String,
      default: null
    }
  },
  notification: types.reduce((typeObj: Record<string, typeof notificationDefaults>, notificationType) => {
    typeObj[notificationType] = notificationDefaults;
    return typeObj;
  }, {})
});


export interface ISettings {
  userId: Schema.Types.ObjectId;
  notification: {
    [type in typeof types[number]]: {
      [channel in typeof channels[number]]: boolean;
    };
  };
  twoFactorAuth: {
    enabled: boolean;
    method: typeof twoFactorAuthMethods[number];
    secret: string | null;
  }
};

export interface SettingsDocument extends Document, ISettings {};
interface SettingsModel extends Model<SettingsDocument> {};

export default model<SettingsDocument, SettingsModel>("Settings", SettingsSchema);
