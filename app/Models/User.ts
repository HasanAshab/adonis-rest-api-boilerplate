import { model, Schema, Document, Model } from "mongoose";
import Authenticatable, { AuthenticatableDocument } from "App/Plugins/Authenticatable";
import HasFactory, { HasFactoryModel } from "App/Plugins/HasFactory";
import HasPolicy, { HasPolicyDocument } from "App/Plugins/HasPolicy";
import HasApiTokens, { HasApiTokensDocument } from "App/Plugins/HasApiTokens";
import Notifiable, { NotifiableDocument } from "App/Plugins/Notifiable";
//import Mediable, { MediableDocument } from "App/Plugins/Mediable";
import { Attachable, Attachment } from "@ioc:Adonis/Mongoose/Plugin/Attachable";
import Settings, { SettingsDocument } from "App/Models/Settings";
import UserPolicy from "App/Policies/UserPolicy";
//import Billable, { BillableDocument } from "App/Plugins/Billable";


const UserSchema = new Schema<UserDocument>({
  name: String,
  username: {
    type: String,
    unique: true
  },
  email: {
    required: true,
    type: String,
    unique: true
  },
  profile: Attachment,
  phoneNumber: String,
  password: {
    type: String,
    hide: true
  },
  role: {
    type: String,
    enum: ["admin", "novice"],
    default: "novice"
  },
  verified: {
    type: Boolean,
    default: false,
  },
  recoveryCodes: {
    type: [String],
    hide: true
  },
  socialId: {
    type: Object,
    index: true,
    hide: true
  }
}, 
{ timestamps: true }
);

UserSchema.virtual("settings").get(function() {
  return Settings.findOne({ userId: this._id });
});

UserSchema.method("createDefaultSettings", function() {
  return Settings.create({ userId: this._id });
});



UserSchema.virtual("isInternal").get(function() {
  return !!this.password;
});

UserSchema.static("internals", function() {
  return this.find({ password: { $ne: null }});
});

UserSchema.static("internal", function() {
  return this.findOne({ password: { $ne: null }});
});


UserSchema.plugin(Authenticatable);
UserSchema.plugin(HasFactory);
UserSchema.plugin(HasPolicy, UserPolicy);
UserSchema.plugin(HasApiTokens);
UserSchema.plugin(Notifiable);
UserSchema.plugin(Attachable);
//UserSchema.plugin(Mediable);
//UserSchema.plugin(Billable);

export interface IUser {
  name: string;
  username: string;
  email: string;
  profile: string | null;
  phoneNumber: string | null;
  password: string | null;
  role: "admin" | "novice";
  verified: boolean;
  recoveryCodes: string[];
  socialId: Record<string, string>;
}

export interface UserDocument extends Document, IUser, AuthenticatableDocument, HasPolicyDocument<UserPolicy>, MediableDocument, HasApiTokensDocument, NotifiableDocument<UserDocument> {
  settings: Query<SettingsDocument, SettingsDocument>;
  createDefaultSettings(): Promise<SettingsDocument>;
};

interface UserModel extends Model<UserDocument>, HasFactoryModel {
  internals(): Query<UserDocument[], UserDocument>;
  internal(): Query<UserDocument | null, UserDocument>;
};

export default model<UserDocument, UserModel>("User", UserSchema);