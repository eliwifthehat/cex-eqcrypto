#!/usr/bin/env node

/**
 * Log Management Script
 * Manages and analyzes production logs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.resolve(__dirname, '../logs');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeLogs() {
  console.log('📊 Analyzing Production Logs...\n');

  if (!fs.existsSync(logsDir)) {
    console.log('❌ No logs directory found. Logs will be created when the server runs.');
    return;
  }

  const files = fs.readdirSync(logsDir);
  const logStats = {
    totalFiles: 0,
    totalSize: 0,
    errorLogs: 0,
    httpLogs: 0,
    combinedLogs: 0,
    exceptionLogs: 0,
    rejectionLogs: 0,
  };

  files.forEach(file => {
    if (file.endsWith('.log') || file.endsWith('.gz')) {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      logStats.totalFiles++;
      logStats.totalSize += stats.size;

      if (file.includes('error')) logStats.errorLogs++;
      if (file.includes('http')) logStats.httpLogs++;
      if (file.includes('combined')) logStats.combinedLogs++;
      if (file.includes('exceptions')) logStats.exceptionLogs++;
      if (file.includes('rejections')) logStats.rejectionLogs++;
    }
  });

  console.log('📋 Log Statistics:');
  console.log(`   Total log files: ${logStats.totalFiles}`);
  console.log(`   Total size: ${formatBytes(logStats.totalSize)}`);
  console.log(`   Error logs: ${logStats.errorLogs}`);
  console.log(`   HTTP logs: ${logStats.httpLogs}`);
  console.log(`   Combined logs: ${logStats.combinedLogs}`);
  console.log(`   Exception logs: ${logStats.exceptionLogs}`);
  console.log(`   Rejection logs: ${logStats.rejectionLogs}`);

  // Check for recent errors
  const errorFiles = files.filter(f => f.includes('error') && f.endsWith('.log'));
  if (errorFiles.length > 0) {
    console.log('\n⚠️  Recent Error Logs:');
    errorFiles.slice(-3).forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${file}: ${formatBytes(stats.size)} (${new Date(stats.mtime).toLocaleDateString()})`);
    });
  }

  return logStats;
}

function cleanOldLogs(daysToKeep = 30) {
  console.log(`🧹 Cleaning logs older than ${daysToKeep} days...\n`);

  if (!fs.existsSync(logsDir)) {
    console.log('❌ No logs directory found.');
    return;
  }

  const files = fs.readdirSync(logsDir);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  let deletedCount = 0;
  let deletedSize = 0;

  files.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtime < cutoffDate) {
      deletedSize += stats.size;
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`   Deleted: ${file}`);
    }
  });

  console.log(`\n✅ Cleanup complete:`);
  console.log(`   Files deleted: ${deletedCount}`);
  console.log(`   Space freed: ${formatBytes(deletedSize)}`);
}

function showRecentErrors(limit = 10) {
  console.log(`🔍 Showing last ${limit} errors...\n`);

  const errorFiles = fs.readdirSync(logsDir)
    .filter(f => f.includes('error') && f.endsWith('.log'))
    .sort()
    .slice(-1);

  if (errorFiles.length === 0) {
    console.log('✅ No error logs found.');
    return;
  }

  const latestErrorFile = path.join(logsDir, errorFiles[0]);
  const content = fs.readFileSync(latestErrorFile, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());

  console.log('Recent Errors:');
  lines.slice(-limit).forEach((line, index) => {
    try {
      const logEntry = JSON.parse(line);
      console.log(`${index + 1}. ${logEntry.timestamp} - ${logEntry.message}`);
      if (logEntry.stack) {
        console.log(`   Stack: ${logEntry.stack.split('\n')[0]}`);
      }
    } catch (e) {
      console.log(`${index + 1}. ${line}`);
    }
  });
}

function showPerformanceMetrics() {
  console.log('⚡ Performance Metrics...\n');

  const combinedFiles = fs.readdirSync(logsDir)
    .filter(f => f.includes('combined') && f.endsWith('.log'))
    .sort()
    .slice(-1);

  if (combinedFiles.length === 0) {
    console.log('❌ No combined logs found.');
    return;
  }

  const latestCombinedFile = path.join(logsDir, combinedFiles[0]);
  const content = fs.readFileSync(latestCombinedFile, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());

  const performanceLogs = lines
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    })
    .filter(log => log && log.message && log.message.includes('Performance'));

  if (performanceLogs.length === 0) {
    console.log('✅ No performance issues detected.');
    return;
  }

  console.log('Performance Issues:');
  performanceLogs.slice(-5).forEach((log, index) => {
    console.log(`${index + 1}. ${log.timestamp} - ${log.message}`);
    if (log.details) {
      console.log(`   Details: ${JSON.stringify(log.details)}`);
    }
  });
}

function main() {
  const command = process.argv[2] || 'analyze';

  switch (command) {
    case 'analyze':
      analyzeLogs();
      break;
    case 'clean':
      const days = parseInt(process.argv[3]) || 30;
      cleanOldLogs(days);
      break;
    case 'errors':
      const limit = parseInt(process.argv[3]) || 10;
      showRecentErrors(limit);
      break;
    case 'performance':
      showPerformanceMetrics();
      break;
    default:
      console.log('📋 Log Management Commands:');
      console.log('   npm run logs:analyze     - Analyze log statistics');
      console.log('   npm run logs:clean [days] - Clean old logs (default: 30 days)');
      console.log('   npm run logs:errors [limit] - Show recent errors (default: 10)');
      console.log('   npm run logs:performance - Show performance metrics');
  }
}

main(); 