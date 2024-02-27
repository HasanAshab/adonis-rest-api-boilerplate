import fs from 'fs';
import path from 'path';

// Function to convert camel case to snake case
const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (letter, index) => {
    return index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`;
  });
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
    } else if (stats.isFile() && file.endsWith('.js')) {
      // Update import paths in JavaScript files
      updateImportPathsInFile(filePath);
    }
  });
};

// Function to update import paths in a JavaScript file
const updateImportPathsInFile = (filePath) => {
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const updatedContent = fileContent.replace(/from\s+['"]([^'"]+)['"]/g, (match, importPath) => {
    const updatedImportPath = camelToSnake(importPath);
    return `from '${updatedImportPath}'`;
  });
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Updated import paths in ${filePath}`);
};

// Start updating import paths in the current directory
updateImportPaths(process.argv[2]);
