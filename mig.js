import fs from 'fs';
import path from 'path';

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

// Start updating import paths in the current directory
updateImportPaths(process.argv[2]);
