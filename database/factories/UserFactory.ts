import Factory from "@ioc:Adonis/Mongoose/Factory"
import { IUser, UserDocument } from "App/Models/User"
import Settings from "App/Models/Settings";

export default class UserFactory extends Factory<IUser, UserDocument> {
  definition() {
    return {
      name: this.faker.person.firstName(),
      username: this.faker.person.firstName(),
      email: this.faker.internet.email(),
      phoneNumber: null,
      password: '$2a$04$p0.vClM1AdG5dy/ndGRsIeo6X9dDLK6hTkqIXeKfHGPH8WLFZW3I.', // Hash of "password" with bcrypt-node of round 1
      verified: true,
      role: "novice" as const,
      profile: null,
      recoveryCodes: [],
      socialId: {}
    };
  }
  
  unverified() {
    return this.state((user: IUser) => {
      user.verified = false;
      return user;
    });
  }
  
  social(provider = "google", id = "100020") {
    return this.state((user: IUser) => {
      user.password = null;
      user.socialId[provider] = id;
      return user;
    });
  }
  
  withRole(name: IUser["role"]) {
    return this.state((user: IUser) => {
      user.role = name;
      return user;
    });
  }
  
  hasSettings(enableTwoFactorAuth = false) {
    return this.external(async (users: UserDocument[]) => {
      const settingsData: any[] = [];
      for(const user of users){
        settingsData.push({
          userId: user._id,
          "twoFactorAuth.enabled": enableTwoFactorAuth
        });
      }
      await Settings.insertMany(settingsData);
    });
  }
  
  withProfile(url = this.faker.internet.avatar()) {
    return this.state((user: IUser) => {
      user.profile = url;
      return user;
    });
  }
  
  withPhoneNumber(phoneNumber = "+15005550006") {
    return this.state((user: IUser) => {
      user.phoneNumber = phoneNumber;
      return user;
    });
  }
}