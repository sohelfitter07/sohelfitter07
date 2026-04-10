// ================================================================
//  ADD CHATBOT TO ALL PAGES — Canadian Fitness Repair
//  ----------------------------------------------------------------
//  This script automatically adds headerfooter.js to every HTML
//  file in your project that doesn't already have it.
//
//  HOW TO RUN:
//  1. Copy this file into the ROOT of your website project folder
//     (same folder where index.html lives)
//  2. Open VS Code
//  3. Open the Terminal: Menu → Terminal → New Terminal
//  4. Type this command and press Enter:
//        node add-chatbot-to-all-pages.js
//  5. Done! Check the output to see which files were updated.
//  6. Upload ALL updated .html files to your server.
// ================================================================

const fs   = require('fs');
const path = require('path');

// The script tag that will be added to every page
const SCRIPT_TAG = '<script defer src="headerfooter.js"></script>';

// Folders to skip (won't touch these)
const SKIP_FOLDERS = ['node_modules', '.git', '.vscode', 'dist', 'build'];

// ── Find all .html files recursively ────────────────────────────
function getAllHtmlFiles(dir) {
  var results = [];
  var items   = fs.readdirSync(dir);

  items.forEach(function(item) {
    var fullPath = path.join(dir, item);
    var stat     = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!SKIP_FOLDERS.includes(item) && !item.startsWith('.')) {
        results = results.concat(getAllHtmlFiles(fullPath));
      }
    } else if (item.toLowerCase().endsWith('.html')) {
      results.push(fullPath);
    }
  });

  return results;
}

// ── Main ─────────────────────────────────────────────────────────
console.log('');
console.log('========================================');
console.log(' Canadian Fitness Repair — Chatbot Setup');
console.log('========================================');
console.log('Scanning for HTML files...\n');

var htmlFiles = getAllHtmlFiles('.');
var updated   = [];
var skipped   = [];
var noBody    = [];

htmlFiles.forEach(function(file) {
  var content = fs.readFileSync(file, 'utf8');

  // Already has headerfooter.js — skip it
  if (content.includes('headerfooter.js')) {
    console.log('⏭  Already has it — skipping:  ' + file);
    skipped.push(file);
    return;
  }

  // No </body> tag — can't safely edit
  if (!content.toLowerCase().includes('</body>')) {
    console.log('⚠️  No </body> found — skipping: ' + file);
    noBody.push(file);
    return;
  }

  // Add the script tag just before </body>
  var newContent = content.replace(/<\/body>/i, SCRIPT_TAG + '\n</body>');
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('✅ Updated:                      ' + file);
  updated.push(file);
});

// ── Summary ──────────────────────────────────────────────────────
console.log('');
console.log('========================================');
console.log(' RESULTS');
console.log('========================================');
console.log('✅ Updated  : ' + updated.length + ' files');
console.log('⏭  Skipped  : ' + skipped.length + ' files (already had chatbot)');
if (noBody.length > 0) {
  console.log('⚠️  No </body>: ' + noBody.length + ' files (check these manually)');
}
console.log('');

if (updated.length > 0) {
  console.log('Files that were updated:');
  updated.forEach(function(f) { console.log('   • ' + f); });
  console.log('');
  console.log('Next step: Upload ALL the files listed above to your server!');
} else {
  console.log('No files needed updating — all pages already have the chatbot!');
}

console.log('');