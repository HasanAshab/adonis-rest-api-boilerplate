import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { DateTime } from 'luxon';
import User from "App/Models/User";

export default class DashboardController extends Controller {
  public async admin() {
    const now = DateTime.local();
    const today = now.set({ hour: 0, minute: 0, second: 0 });
  
    const [ totalUsers, newUsersToday ] = await Promise.all([
      User.query().where('role', 'user').count('*'),
      User.query().where('role', 'user').where('created_at', '>=', today.toJSDate()).count('*')
    ]);
    
    return { 
      data: { totalUsers, newUsersToday }
    }
  }
}

