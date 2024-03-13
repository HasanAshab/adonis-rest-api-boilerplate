import fs from 'fs';
import path from 'path';

class Wildcard {
  static caseInsensitive = false
  
  static match(str, query) {
    if(this.caseInsensitive) {
      query = query.toLowerCase()
      str = str.toLowerCase()
    }

    const regexQuery = query
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace('*', `([^${query.split('*')[1]}]+)`)
      .replaceAll('*', '\\*');
    const regex = new RegExp(regexQuery);
    return regex.test(str);
  }

  static replace(str, query, replacement, replacedStr = str) {
    if(this.caseInsensitive) {
      query = query.toLowerCase()
    }
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
      'bin/search.js',
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


// Function to convert PascalCase to snake_case
const pascalToSnake = (str) => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
};

// Function to recursively update import paths in a directory
const updateImportPaths = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      // Recursively update import paths in subdirectories
      updateImportPaths(filePath);
    } else if (stats.isFile() && file.endsWith('.ts')) {
      // Update import paths in JavaScript files
      updateImportPathsInFile(filePath);
    }
  });
};

// Function to update import paths in a JavaScript file
const updateImportPathsInFile = (filePath) => {
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const updatedContent = fileContent.replace(/(import\s+.+?\s+from\s+['"])(.+?)(['"])/g, (match, start, importPath, end) => {
    const updatedPath = importPath.split('/').map(pascalToSnake).join('/');
    return `${start}${updatedPath}${end}`;
  });
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Updated import paths in ${filePath}`);
};

//updateImportPaths('tests');
Wildcard.caseInsensitive = true
//await new Search(`middleware.throttle('*')`, '*Throttle').run()
new Search(`import { test } from '@japa/runner'`, `import { test } from '@japa/runner'\nimport { refreshDatabase } from '#tests/helpers'`).run()

