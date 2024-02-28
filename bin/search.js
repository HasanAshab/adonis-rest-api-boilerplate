import fs from 'fs';
import path from 'path';

class Wildcard {
  static match(str, query) {
    const regexQuery = query
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace('*', `([^${query.split('*')[1]}]+)`)
      .replaceAll('*', '\\*');
    const regex = new RegExp(regexQuery);
    return regex.test(str);
  }

  static replace(str, query, replacement, replacedStr = str) {
    const regexQuery = query
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace('*', `([^${query.split('*')[1]}]+)`)
      .replaceAll('*', '\\*');
    const regex = new RegExp(regexQuery, 'g');
    return str.replace(regex, (_, wildcard) =>
      replacement.replaceAll('*', wildcard)
    );
  }
}

class Search {
  constructor(query, replace, dir) {
    this.query = query;
    this.replace = replace;
    this.dir = dir;
    this.exclude = [
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
      'backup',
      'docs',
      'storage',
    ];
  }

  async run() {
    console.log(this)
    console.log((this.replace ? 'Replacing' : 'Searching') + ' started...\n');
    await this.searchFiles(this.dir ?? '.', this.query, this.replace);
  }

  async searchFiles(currentDir, query, replace) {
    const files = fs.readdirSync(currentDir);
    const promises = [];

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const fullPath = filePath;
      const stat = fs.statSync(filePath);
      if (this.isExcluded(fullPath)) continue;
      if (stat.isDirectory()) {
        const promise = this.searchFiles(filePath, query, replace);
        promises.push(promise);
      } else if (stat.isFile()) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        if (Wildcard.match(fileContent, query)) {
          if (!replace) {
            console.log('Matched: ' + filePath);
            continue;
          }
          const replacedContent = Wildcard.replace(fileContent, query, replace);
          const promise = fs.promises.writeFile(filePath, replacedContent);
          promises.push(promise);
          console.log('Modified: ' + filePath);
        }
      }
    }
    await Promise.all(promises);
  }

  isExcluded(path) {
    return this.exclude.includes(path);
  }
}


new Search('config.', 'config.').run()
//new Search(...process.argv.splice(2)).run()