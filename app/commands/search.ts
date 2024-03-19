import fs from 'node:fs'
import path from 'node:path'
import { BaseCommand } from '@adonisjs/core/ace'
import { args, flags } from '@adonisjs/core/ace'

class Wildcard {
  static match(str: string, query: string): boolean {
    const regexQuery = query
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace('*', `([^${query.split('*')[1]}]+)`)
      .replaceAll('*', '\\*')
    const regex = new RegExp(regexQuery)
    return regex.test(str)
  }

  static replace(str: string, query: string, replacement: string, replacedStr = str): string {
    const regexQuery = query
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace('*', `([^${query.split('*')[1]}]+)`)
      .replaceAll('*', '\\*')
    const regex = new RegExp(regexQuery, 'g')
    return str.replace(regex, (_, wildcard) => replacement.replaceAll('*', wildcard))
  }
}

export default class Search extends BaseCommand {
  static commandName = 'search'

  @args.string()
  declare query: string

  @flags.string()
  declare replace?: string

  @flags.string()
  declare dir?: string

  protected exclude = [
    'package.json',
    'package-lock.json',
    'node_modules',
    '.git',
    '.gitignore',
    '.env',
    'tsconfig.json',
    'artisan',
    'artisan.ts',
    'build',
    'artisan',
    'backup',
    'docs',
    'storage',
  ]

  async run() {
    this.logger.info((this.replace ? 'Replacing' : 'Searching') + ' started...\n')
    await this.searchFiles(this.dir ?? '.', this.query)
  }

  private async searchFiles(currentDir: string, query: string) {
    const files = fs.readdirSync(currentDir)
    const promises = []

    for (const file of files) {
      const filePath = path.join(currentDir, file)
      const fullPath = filePath
      const stat = fs.statSync(filePath)
      if (this.exclude.includes(fullPath)) continue
      if (stat.isDirectory()) {
        const promise = this.searchFiles(filePath, query)
        promises.push(promise)
      } else if (stat.isFile()) {
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        //this.logger.debug('Searching: ' + filePath);

        if (Wildcard.match(fileContent, query)) {
          if (!this.replace) {
            this.logger.info('Matched: ' + filePath)
            continue
          }

          const replacedContent = Wildcard.replace(fileContent, query, this.replace)
          const promise = fs.promises.writeFile(filePath, replacedContent)
          promises.push(promise)
          this.logger.info('Modified: ' + filePath)
        }
      }
    }
    await Promise.all(promises)
  }
}
