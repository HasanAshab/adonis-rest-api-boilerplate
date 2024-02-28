import 'reflect-metadata'
import 'dotenv/config'
import '~/vendor/autoload'
import 'Config/load'

import config from 'Config'
import app from '~/main/app'

app.server.listen(config.get('app.port'))
