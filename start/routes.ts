import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'


await router.discover('routes/v1', (group) => {
  group
    .use(middleware.throttle('low'))
    .prefix('/api/v1/')
    //.as('v1')
})


// {
//   use: middleware.throttle('low'),
//   prefix: 'api/v1',
//   as: 'v1'
// }



// Routes for V1
// router.group(() => 
//   router.discover('routes/v1')
// )
// .use(middleware.throttle('low'))
// .prefix('/api/v1/')
// .as('v1')