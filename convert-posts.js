import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STAGING_DIR = path.join(__dirname, 'staging');

function convertPost(postPath) {
  try {
    const content = fs.readFileSync(postPath, 'utf8');
    
    // Split by the separator
    const parts = content.split('<!--# START POST #-->');
    if (parts.length < 2) {
      console.warn(`Skipping ${postPath}: Missing separator`);
      return;
    }
    
    // Parse JSON frontmatter
    const jsonFrontmatter = parts[0].trim();
    const markdownContent = parts.slice(1).join('');
    
    let metadata;
    try {
      metadata = JSON.parse(jsonFrontmatter);
    } catch (e) {
      console.error(`Error parsing JSON in ${postPath}:`, e);
      return;
    }
    
    // Convert dates from timestamps to ISO strings
    if (metadata.datePosted) {
      metadata.datePosted = new Date(metadata.datePosted).toISOString();
    }
    if (metadata.dateEdited) {
      metadata.dateEdited = new Date(metadata.dateEdited).toISOString();
    } else if (metadata.datePosted) {
      metadata.dateEdited = metadata.datePosted;
    }
    
    // Convert to YAML frontmatter
    const yamlFrontmatter = toYAML(metadata);
    
    // Write new content
    const newContent = `---\n${yamlFrontmatter}---\n${markdownContent}`;
    fs.writeFileSync(postPath, newContent, 'utf8');
    console.log(`Converted: ${postPath}`);
  } catch (error) {
    console.error(`Error converting ${postPath}:`, error);
  }
}

function toYAML(obj, indent = 0) {
  const indentStr = '  '.repeat(indent);
  let yaml = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    
    if (Array.isArray(value)) {
      yaml += `${indentStr}${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'string') {
          // Escape quotes in strings
          const escaped = item.replace(/"/g, '\\"');
          yaml += `${indentStr}  - "${escaped}"\n`;
        } else {
          yaml += `${indentStr}  - ${item}\n`;
        }
      });
    } else if (typeof value === 'object') {
      yaml += `${indentStr}${key}:\n${toYAML(value, indent + 1)}`;
    } else if (typeof value === 'string') {
      // Check if string needs quotes (contains special chars, starts with number, etc.)
      const needsQuotes = /[:{}\[\],&*#?|>'"%@`]/.test(value) || value.trim() !== value || value.includes('\n');
      if (needsQuotes) {
        // Escape quotes and newlines
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
        yaml += `${indentStr}${key}: "${escaped}"\n`;
      } else {
        yaml += `${indentStr}${key}: ${value}\n`;
      }
    } else if (typeof value === 'boolean') {
      yaml += `${indentStr}${key}: ${value}\n`;
    } else {
      yaml += `${indentStr}${key}: ${value}\n`;
    }
  }
  
  return yaml;
}

// Find all markdown files in staging
function findMarkdownFiles(dir) {
  const files = [];
  
  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

// Convert all posts
console.log('Converting posts...');
const mdFiles = findMarkdownFiles(STAGING_DIR);
mdFiles.forEach(convertPost);
console.log(`Converted ${mdFiles.length} posts`);

