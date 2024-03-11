import { listDirectoryFiles } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'

/*
|--------------------------------------------------------------------------
| Exporting an array of commands
|--------------------------------------------------------------------------
|
| Instead of manually exporting each file from this directory, we use the
| helper `listDirectoryFiles` to recursively collect and export an array
| of filenames.
|
| Couple of things to note:
|
| 1. The file path must be relative from the project root and not this directory.
| 2. We must ignore this file to avoid getting into an infinite loop
|
*/
//Todo
export default [
  './search.js',
  './clear_uploads.js',
  './create_test_user.js',
  './decrypt_env.js'
]

/*
export default listDirectoryFiles(__dirname, Application.appRoot, [
	'./commands/index',
]);
*/
