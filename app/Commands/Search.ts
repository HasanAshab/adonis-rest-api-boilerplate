import { BaseCommand, args, flags } from '@adonisjs/core/build/standalone'
import fs from "fs";
import path from "path";


export default class Wildcard {
  static match(str: string, query: string): boolean {
    const regexQuery = query
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace("*", `([^${query.split("*")[1]}]+)`)
      .replaceAll("*", "\\*");
    const regex = new RegExp(regexQuery);
    return regex.test(str);
  }

  static replace(str: string, query: string, replacement: string, replacedStr = str): string {
    const regexQuery = query
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace("*", `([^${query.split("*")[1]}]+)`)
      .replaceAll("*", "\\*");
    const regex = new RegExp(regexQuery, "g");
    return str.replace(regex, (_, wildcard) => replacement.replaceAll("*", wildcard))
  }
}


export default class Search extends BaseCommand {
  public static commandName = 'search';
  
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }
  
  @args.string()
  declare query: string;
  
  @args.string({
    required: false
  })
  declare replace?: string;
  
  @flags.string()
  declare dir = '.';
  
  protected exclude = ["package.json", "package-lock.json", "node_modules", ".git", ".gitignore", ".env", "tsconfig.json", "artisan", "artisan.ts", "dist", "artisan", "backup", "docs", "storage"];

  public async run() {
    if(this.replace) {
      this.info("\nReplacing started...\n");
    }
    else {
      this.info("\nSearching started...\n");
    }
    
    await this.searchFiles(this.dir, this.query, this.replace);
  }

  private async searchFiles(currentDir: string, query: string, replace?: string) {
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
        const fileContent = fs.readFileSync(filePath, "utf-8");
        if(Wildcard.match(fileContent, query)){
          if(replace){
            const replacedContent = Wildcard.replace(fileContent, query, replace);
            const promise = fs.promises.writeFile(filePath, replacedContent);
            promises.push(promise);
          }
          this.info(filePath);
        }
      }
    }
    await Promise.all(promises);
  }
  
  private isExcluded(path: string): boolean {
    return this.exclude.includes(path);
  }
}