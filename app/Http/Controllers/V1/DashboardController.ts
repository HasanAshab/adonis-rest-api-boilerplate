import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class DashboardController {
  public async admin() {
    const data = await User.query().where('role', 'user').getCount({
      totalUsers: '*',
      newUsersToday: "CASE WHEN DATE_TRUNC('day', created_at) = CURRENT_DATE THEN 1 END",
    })

    return { data }
  }
}
