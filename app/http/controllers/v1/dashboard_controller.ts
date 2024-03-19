import User from '#models/user'

export default class DashboardController {
  async admin() {
    const data = await User.where('role', 'user').getCount({
      totalUsers: '*',
      newUsersToday: "CASE WHEN DATE_TRUNC('day', created_at) = CURRENT_DATE THEN 1 END",
    })

    return { data }
  }
}
