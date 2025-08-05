#!/usr/bin/env node

/**
 * Build Analysis Script
 * Analyzes production build performance and provides optimization recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '../dist/public');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBuild() {
  console.log('🔍 Analyzing Production Build...\n');

  if (!fs.existsSync(distPath)) {
    console.error('❌ Build directory not found. Run "npm run build:prod" first.');
    process.exit(1);
  }

  const files = fs.readdirSync(distPath);
  const assets = {
    js: [],
    css: [],
    other: [],
    total: 0
  };

  // Recursively scan all files
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        scanDirectory(itemPath);
      } else {
        const relativePath = path.relative(distPath, itemPath);
        const size = stats.size;
        const sizeFormatted = formatBytes(size);

        if (item.endsWith('.js')) {
          assets.js.push({ name: relativePath, size, sizeFormatted });
        } else if (item.endsWith('.css')) {
          assets.css.push({ name: relativePath, size, sizeFormatted });
        } else {
          assets.other.push({ name: relativePath, size, sizeFormatted });
        }

        assets.total += size;
      }
    });
  }

  scanDirectory(distPath);

  // Sort by size (largest first)
  assets.js.sort((a, b) => b.size - a.size);
  assets.css.sort((a, b) => b.size - a.size);
  assets.other.sort((a, b) => b.size - a.size);

  console.log('📊 Build Analysis Results:\n');

  console.log('📦 JavaScript Files:');
  assets.js.forEach(file => {
    console.log(`   ${file.name}: ${file.sizeFormatted}`);
  });

  console.log('\n🎨 CSS Files:');
  assets.css.forEach(file => {
    console.log(`   ${file.name}: ${file.sizeFormatted}`);
  });

  console.log('\n📁 Other Files:');
  assets.other.forEach(file => {
    console.log(`   ${file.name}: ${file.sizeFormatted}`);
  });

  console.log(`\n📈 Total Build Size: ${formatBytes(assets.total)}`);

  // Performance recommendations
  console.log('\n💡 Performance Recommendations:');

  const largeJsFiles = assets.js.filter(file => file.size > 500 * 1024); // > 500KB
  const largeCssFiles = assets.css.filter(file => file.size > 100 * 1024); // > 100KB

  if (largeJsFiles.length > 0) {
    console.log('\n⚠️  Large JavaScript files detected:');
    largeJsFiles.forEach(file => {
      console.log(`   - ${file.name} (${file.sizeFormatted})`);
      console.log('     Consider: Code splitting, lazy loading, tree shaking');
    });
  }

  if (largeCssFiles.length > 0) {
    console.log('\n⚠️  Large CSS files detected:');
    largeCssFiles.forEach(file => {
      console.log(`   - ${file.name} (${file.sizeFormatted})`);
      console.log('     Consider: CSS purging, critical CSS extraction');
    });
  }

  if (assets.total > 2 * 1024 * 1024) { // > 2MB
    console.log('\n⚠️  Total bundle size is large (>2MB)');
    console.log('   Consider:');
    console.log('   - Code splitting and lazy loading');
    console.log('   - Tree shaking unused code');
    console.log('   - Optimizing images and assets');
    console.log('   - Using CDN for large libraries');
  }

  // Check for optimization opportunities
  console.log('\n🚀 Optimization Opportunities:');

  const jsTotal = assets.js.reduce((sum, file) => sum + file.size, 0);
  const cssTotal = assets.css.reduce((sum, file) => sum + file.size, 0);

  if (jsTotal > 1024 * 1024) { // > 1MB
    console.log('   - JavaScript bundle is large, consider code splitting');
  }

  if (cssTotal > 200 * 1024) { // > 200KB
    console.log('   - CSS bundle is large, consider purging unused styles');
  }

  // Check for gzip compression potential
  console.log('\n🗜️  Compression Analysis:');
  console.log(`   Estimated gzip size: ~${formatBytes(assets.total * 0.3)}`);
  console.log(`   Estimated brotli size: ~${formatBytes(assets.total * 0.25)}`);

  // Bundle analysis
  console.log('\n📋 Bundle Analysis:');
  console.log(`   JavaScript files: ${assets.js.length}`);
  console.log(`   CSS files: ${assets.css.length}`);
  console.log(`   Other files: ${assets.other.length}`);
  console.log(`   Total files: ${files.length}`);

  // Performance score
  let score = 100;
  if (assets.total > 2 * 1024 * 1024) score -= 20;
  if (largeJsFiles.length > 0) score -= 15;
  if (largeCssFiles.length > 0) score -= 10;
  if (assets.js.length > 5) score -= 5;

  console.log(`\n⭐ Performance Score: ${Math.max(0, score)}/100`);

  if (score >= 80) {
    console.log('   🎉 Excellent build performance!');
  } else if (score >= 60) {
    console.log('   ✅ Good build performance, some optimizations possible');
  } else {
    console.log('   ⚠️  Build needs optimization');
  }

  console.log('\n✅ Build analysis complete!');
}

analyzeBuild(); 