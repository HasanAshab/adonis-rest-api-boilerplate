import Controller from "~/app/http/controllers/Controller";
import { RequestHandler } from "~/core/decorators";
import { AuthenticRequest } from "~/core/express";
import Config from "Config";
import Settings from "~/app/models/Settings";
import SetupNotificationPreferenceRequest from "~/app/http/requests/v1/settings/SetupNotificationPreferenceRequest";
import UpdateAppSettingsRequest from "~/app/http/requests/v1/settings/UpdateAppSettingsRequest";

export default class SettingsController extends Controller {
  public static readonly VERSION = 'v1';

  @RequestHandler
  async index(req: AuthenticRequest) {
    return await req.user.settings.lean();
  }
  
  @RequestHandler
  async setupNotificationPreference(req: SetupNotificationPreferenceRequest) {
    await Settings.updateOne({ userId: req.user._id }, { notification: req.body });
    return "Settings saved!";
  }
  
  @RequestHandler
  async getAppSettings() {
    return Config.get();
  }

  @RequestHandler
  async updateAppSettings({ body }: UpdateAppSettingsRequest) {
    Config.set(body);
    return "App Settings updated!";
  }
}
