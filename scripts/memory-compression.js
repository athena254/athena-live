#!/usr/bin/env node
/**
 * Memory Compression Utility
 * Summarizes old memory files to save space while preserving key information
 * 
 * Usage: node memory-compression.js [options]
 * 
 * Options:
 *   --days N       Process files older than N days (default: 7)
 *   --dry-run      Show what would be compressed without doing it
 *   --output-dir   Directory to save summaries (default: same as source)
 *   --verbose      Show detailed output
 * 
 * Looks for memory files in:
 *   - /root/.openclaw/sandboxes/agent-main-*/memory/
 *   - /root/.openclaw/memory/
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const options = {
  days: parseInt(args.find(a => a.startsWith('--days='))?.split('=')[1] || '7'),
  dryRun: args.includes('--dry-run'),
  outputDir: args.find(a => a.startsWith('--output-dir='))?.split('=')[1] || null,
  verbose: args.includes('--verbose')
};

const MEMORY_DIRS = [
  '/root/.openclaw/memory',
  '/root/.openclaw/sandboxes'
];

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
  cyan: '\x1b[36m', gray: '\x1b[90m', bright: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

function log(text, color = 'reset') {
  console.log(colorize(text, color));
}

function findMemoryFiles() {
  const files = [];
  const now = Date.now();
  const cutoff = now - (options.days * 24 * 60 * 60 * 1000);
  
  // Find sandboxes with memory folders
  const sandboxPattern = /agent-main-[a-f0-9]+/;
  
  for (const dir of MEMORY_DIRS) {
    if (!fs.existsSync(dir)) continue;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Check if it's a sandbox with memory folder
      if (entry.isDirectory() && sandboxPattern.test(entry.name)) {
        const memoryPath = path.join(fullPath, 'memory');
        if (fs.existsSync(memoryPath)) {
          collectMarkdownFiles(memoryPath, cutoff, files);
        }
      }
      
      // Check if it's directly a memory folder
      if (entry.name === 'memory' && entry.isDirectory()) {
        collectMarkdownFiles(fullPath, cutoff, files);
      }
    }
  }
  
  return files;
}

function collectMarkdownFiles(dir, cutoff, files) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.name.endsWith('.md')) continue;
      
      const fullPath = path.join(dir, entry.name);
      const stats = fs.statSync(fullPath);
      
      // Skip files modified after cutoff
      if (stats.mtimeMs > cutoff) continue;
      
      // Skip summary files (already compressed)
      if (entry.name.includes('-summary') || entry.name.includes('.compressed')) continue;
      
      files.push({
        path: fullPath,
        name: entry.name,
        size: stats.size,
        modified: stats.mtime
      });
    }
  } catch (e) {
    if (options.verbose) log(`Warning: Could not read ${dir}: ${e.message}`, 'yellow');
  }
}

function generateSummary(content, filename) {
  const lines = content.split('\n').filter(l => l.trim());
  const dateMatch = filename.match(/\d{4}-\d{2}-\d{2}/);
  const date = dateMatch ? dateMatch[0] : 'unknown-date';
  
  // Extract key sections
  const sections = [];
  let currentSection = { title: 'General', content: [] };
  
  for (const line of lines) {
    // Detect section headers
    if (line.match(/^#{1,3}\s/)) {
      if (currentSection.content.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: line.replace(/^#+\s+/, ''), content: [] };
    } else {
      currentSection.content.push(line);
    }
  }
  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }
  
  // Generate compact summary
  let summary = `# Memory Summary: ${date}\n\n`;
  summary += `**Original file:** ${filename}\n`;
  summary += `**Compressed:** ${new Date().toISOString().split('T')[0]}\n\n`;
  
  if (sections.length > 0) {
    summary += `## Sections (${sections.length})\n\n`;
    for (const section of sections.slice(0, 10)) {
      const preview = section.content.slice(0, 3).join(' ').substring(0, 100);
      summary += `- **${section.title}**: ${preview}${preview.length >= 100 ? '...' : ''}\n`;
    }
  }
  
  // Key metrics
  summary += `\n## Stats\n`;
  summary += `- Total lines: ${lines.length}\n`;
  summary += `- Total sections: ${sections.length}\n`;
  summary += `- Original size: ${(content.length / 1024).toFixed(1)} KB\n`;
  
  return summary;
}

async function compressFile(file) {
  try {
    const content = fs.readFileSync(file.path, 'utf8');
    const summary = generateSummary(content, file.name);
    
    const baseName = file.name.replace('.md', '');
    const summaryName = `${baseName}-summary.md`;
    const outputPath = options.outputDir || path.dirname(file.path);
    const summaryPath = path.join(outputPath, summaryName);
    
    if (options.dryRun) {
      log(`[DRY-RUN] Would compress: ${file.path} -> ${summaryPath}`, 'yellow');
      return { file, action: 'compress', summaryPath, saved: file.size - summary.length };
    }
    
    fs.writeFileSync(summaryPath, summary, 'utf8');
    log(`✓ Compressed: ${file.name} -> ${summaryName} (saved ${((file.size - summary.length) / 1024).toFixed(1)} KB)`, 'green');
    
    return { file, action: 'compress', summaryPath, saved: file.size - summary.length };
  } catch (e) {
    log(`✗ Error processing ${file.path}: ${e.message}`, 'red');
    return { file, action: 'error', error: e.message };
  }
}

async function main() {
  log('\n🧠 Memory Compression Utility', 'cyan');
  log('═'.repeat(50), 'gray');
  log(`Processing files older than ${options.days} days\n`, 'dim');
  
  if (options.dryRun) {
    log('[DRY-RUN MODE - No files will be modified]\n', 'yellow');
  }
  
  const files = findMemoryFiles();
  
  if (files.length === 0) {
    log('No memory files found older than threshold.', 'yellow');
    return;
  }
  
  log(`Found ${files.length} memory file(s) to process:\n`, 'cyan');
  
  let totalSize = 0;
  for (const file of files) {
    totalSize += file.size;
    log(`  - ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'dim');
    if (options.verbose) {
      log(`    Modified: ${file.modified.toISOString()}`, 'dim');
    }
  }
  
  log(`\nTotal size: ${(totalSize / 1024).toFixed(1)} KB\n`, 'cyan');
  
  if (options.dryRun) {
    log('Dry run complete. Run without --dry-run to compress files.', 'yellow');
    return;
  }
  
  // Process files
  let processed = 0;
  let savedBytes = 0;
  
  for (const file of files) {
    const result = await compressFile(file);
    if (result.action === 'compress') {
      processed++;
      savedBytes += Math.max(0, result.saved);
    }
  }
  
  log(`\n✓ Processed ${processed}/${files.length} files`, 'green');
  log(`✓ Total space saved: ${(savedBytes / 1024).toFixed(1)} KB`, 'green');
}

main().catch(e => {
  log(`Fatal error: ${e.message}`, 'red');
  process.exit(1);
});
