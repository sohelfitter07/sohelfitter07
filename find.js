#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// File extensions to scan (add more if needed, e.g., .php, .vue)
const EXTENSIONS = ['.html', '.htm'];

// Regular expression: matches "90" that is followed (with optional spaces/hyphen) by "day/s warranty"
// It only replaces the number "90", leaving the rest of the phrase unchanged.
const WARRANTY_REGEX = /\b90(?=\s*(?:-)?\s*day?s?\s+warranty\b)/gi;

/**
 * Recursively get all files with allowed extensions inside a directory.
 */
async function getFiles(dir, filesList = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip common version control / dependency directories
            if (entry.name === '.git' || entry.name === 'node_modules') continue;
            await getFiles(fullPath, filesList);
        } else if (entry.isFile() && EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
            filesList.push(fullPath);
        }
    }
    return filesList;
}

/**
 * Process a single file: read content, replace warranty numbers, write back if changed.
 */
async function processFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const newContent = content.replace(WARRANTY_REGEX, '30');

        if (content !== newContent) {
            await fs.writeFile(filePath, newContent, 'utf8');
            console.log(`✅ Modified: ${filePath}`);
            return true;
        }
        return false;
    } catch (err) {
        console.error(`❌ Error processing ${filePath}:`, err.message);
        return false;
    }
}

async function main() {
    // Get target directory (default = current working directory)
    const targetDir = process.argv[2] || process.cwd();
    console.log(`Scanning directory: ${targetDir}`);

    let files;
    try {
        files = await getFiles(targetDir);
    } catch (err) {
        console.error(`Failed to read directory: ${err.message}`);
        process.exit(1);
    }

    if (files.length === 0) {
        console.log('No HTML/HTM files found.');
        return;
    }

    console.log(`Found ${files.length} HTML file(s).\n`);

    let modifiedCount = 0;
    for (const file of files) {
        const changed = await processFile(file);
        if (changed) modifiedCount++;
    }

    console.log(`\n✅ Done. ${modifiedCount} file(s) were modified.`);
    console.log(`Pattern replaced: "90" → "30" in phrases like "90 day warranty", "90 days warranty", "90-day warranty", etc.`);
}

main().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});