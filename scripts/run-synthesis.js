#!/usr/bin/env node

/**
 * PM Agent On-Demand Synthesis Script
 * 
 * Analyzes git changes from the past 7 days and automatically extracts
 * learnings to update changelog files. Fully automated — no user input required.
 * 
 * Usage: node scripts/run-synthesis.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(process.cwd());
const CHANGELOGS_DIR = path.join(REPO_ROOT, 'changelogs');
const WORKFLOWS_DIR = path.join(REPO_ROOT, 'workflows');
const ARCHIVES_DIR = path.join(REPO_ROOT, 'archives');

console.log('🔄 PM Agent Synthesis — Analyzing 7 days of changes...\n');

// ============================================================================
// 1. GET GIT LOG FROM PAST 7 DAYS
// ============================================================================

function getGitLogPast7Days() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const log = execSync(
      `git log --all --oneline --since="${dateStr}" --name-status`,
      { cwd: REPO_ROOT, encoding: 'utf-8' }
    );
    return log;
  } catch (err) {
    console.error('❌ Failed to get git log:', err.message);
    process.exit(1);
  }
}

// ============================================================================
// 2. PARSE GIT LOG & EXTRACT HEURISTIC LEARNINGS
// ============================================================================

function extractLearnings(gitLog) {
  const learnings = new Map(); // { category: count }
  const patterns = {
    fileCreation: [],
    fileDeletion: [],
    workflowChanges: [],
    archiveActivity: [],
    templateUpdates: [],
    scriptUpdates: [],
  };

  const lines = gitLog.split('\n');
  let currentCommit = null;
  let currentMessage = '';

  for (const line of lines) {
    // Match commit line: "abc1234 Commit message"
    if (/^[a-f0-9]{7}/.test(line)) {
      const parts = line.split(' ');
      currentCommit = parts[0];
      currentMessage = parts.slice(1).join(' ').toLowerCase();
      continue;
    }

    // Parse file status lines (A=added, D=deleted, M=modified)
    const match = line.match(/^([ADM])\s+(.+)$/);
    if (!match) continue;

    const [, status, filePath] = match;

    // --- FILE CREATION PATTERNS ---
    if (status === 'A') {
      if (filePath.includes('workflows/')) {
        patterns.workflowChanges.push(`Created workflow: ${path.basename(filePath)}`);
      } else if (filePath.includes('templates/')) {
        patterns.templateUpdates.push(`Created template: ${path.basename(filePath)}`);
      } else if (filePath.includes('scripts/')) {
        patterns.scriptUpdates.push(`Created script: ${path.basename(filePath)}`);
      } else if (filePath.includes('archives/')) {
        patterns.archiveActivity.push(`Archived: ${path.basename(filePath)}`);
      } else {
        patterns.fileCreation.push(filePath);
      }
    }

    // --- FILE DELETION PATTERNS ---
    if (status === 'D') {
      if (filePath.includes('workflows/')) {
        patterns.workflowChanges.push(`Removed workflow: ${path.basename(filePath)}`);
      } else {
        patterns.fileDeletion.push(filePath);
      }
    }

    // --- MODIFICATION PATTERNS (from commit message) ---
    if (status === 'M') {
      if (currentMessage.includes('template')) {
        learnings.set('Template improvements', (learnings.get('Template improvements') || 0) + 1);
      }
      if (currentMessage.includes('linking') || currentMessage.includes('link')) {
        learnings.set('Linking strategy refinement', (learnings.get('Linking strategy refinement') || 0) + 1);
      }
      if (currentMessage.includes('version')) {
        learnings.set('Versioning system optimization', (learnings.get('Versioning system optimization') || 0) + 1);
      }
      if (currentMessage.includes('automation') || currentMessage.includes('auto')) {
        learnings.set('Automation & efficiency gains', (learnings.get('Automation & efficiency gains') || 0) + 1);
      }
      if (currentMessage.includes('workflow') || currentMessage.includes('process')) {
        learnings.set('Workflow standardization', (learnings.get('Workflow standardization') || 0) + 1);
      }
      if (currentMessage.includes('folder') || currentMessage.includes('structure')) {
        learnings.set('Project organization patterns', (learnings.get('Project organization patterns') || 0) + 1);
      }
    }
  }

  // Aggregate learned patterns into structured insights
  if (patterns.workflowChanges.length > 0) {
    learnings.set(
      'Workflow refinement & standardization',
      (learnings.get('Workflow refinement & standardization') || 0) + patterns.workflowChanges.length
    );
  }
  if (patterns.archiveActivity.length > 0) {
    learnings.set(
      'Archive structure & organization',
      (learnings.get('Archive structure & organization') || 0) + patterns.archiveActivity.length
    );
  }
  if (patterns.templateUpdates.length > 0) {
    learnings.set(
      'Template centralization & reuse',
      (learnings.get('Template centralization & reuse') || 0) + patterns.templateUpdates.length
    );
  }
  if (patterns.scriptUpdates.length > 0) {
    learnings.set(
      'Git automation & scripting',
      (learnings.get('Git automation & scripting') || 0) + patterns.scriptUpdates.length
    );
  }

  // Sort by frequency and return top 3
  return Array.from(learnings.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([learning]) => learning)
    .filter(Boolean);
}

// ============================================================================
// 3. READ EXISTING CHANGELOGS TO AVOID DUPLICATES
// ============================================================================

function readExistingChangelogs() {
  const existing = new Set();
  
  try {
    const files = fs.readdirSync(CHANGELOGS_DIR).filter(f => f.endsWith('_changelog.md'));
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(CHANGELOGS_DIR, file), 'utf-8');
      // Extract all learning entries (lines after dates)
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('[')) {
          // Store normalized version
          existing.add(line.toLowerCase().trim());
        }
      }
    }
  } catch (err) {
    // Changelogs dir might not exist yet
  }

  return existing;
}

// ============================================================================
// 4. UPDATE CHANGELOG FILES
// ============================================================================

function updateChangelogs(newLearnings, existingLearnings) {
  const today = new Date().toISOString().split('T')[0];
  const changelogFiles = [
    'prd-creator_changelog.md',
    'experiment-designer_changelog.md',
    'objection-mapper_changelog.md',
  ];

  let updateCount = 0;

  for (const filename of changelogFiles) {
    const filepath = path.join(CHANGELOGS_DIR, filename);
    let content = '';

    // Read existing if exists
    if (fs.existsSync(filepath)) {
      content = fs.readFileSync(filepath, 'utf-8');
    } else {
      // Create header if new file
      const skillName = filename.replace('_changelog.md', '').replace(/-/g, ' ');
      content = `# ${skillName.toUpperCase()} — Learning Changelog\n\n`;
    }

    // Check which learnings are new
    const learningsToAdd = newLearnings.filter(
      learning => !existingLearnings.has(learning.toLowerCase())
    );

    if (learningsToAdd.length === 0) {
      console.log(`✓ ${filename}: No new learnings (all documented)`);
      continue;
    }

    // Append new learnings with date
    learningsToAdd.forEach(learning => {
      content += `- **${today}**: ${learning}\n`;
      updateCount++;
    });

    // Write back
    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`✓ ${filename}: Added ${learningsToAdd.length} new learning(s)`);
  }

  return updateCount;
}

// ============================================================================
// 5. COMMIT & PUSH
// ============================================================================

function commitAndPush(updateCount, learnings) {
  if (updateCount === 0) {
    console.log('\n✓ No changelog updates needed. Everything is current.\n');
    return;
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const summary = learnings.slice(0, 2).join(', ');
    const message = `Weekly synthesis [${today}]: ${updateCount} learning(s) recorded (${summary})`;

    execSync('git add changelogs/', { cwd: REPO_ROOT, stdio: 'pipe' });
    execSync(`git commit -m "${message}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
    execSync('git push origin main', { cwd: REPO_ROOT, stdio: 'pipe' });

    console.log(`\n✅ Committed & pushed: "${message}"\n`);
  } catch (err) {
    console.error('\n⚠️  Commit/push failed:', err.message);
    console.log('   (Changes are staged locally. Review with: git status)\n');
  }
}

// ============================================================================
// 6. RUN SYNTHESIS
// ============================================================================

function runSynthesis() {
  const gitLog = getGitLogPast7Days();
  
  if (!gitLog.trim()) {
    console.log('✓ No changes in past 7 days. Nothing to synthesize.\n');
    return;
  }

  const newLearnings = extractLearnings(gitLog);
  const existingLearnings = readExistingChangelogs();

  console.log(`📊 Extracted learnings: ${newLearnings.join(', ') || 'none'}\n`);

  const updateCount = updateChangelogs(newLearnings, existingLearnings);
  commitAndPush(updateCount, newLearnings);
}

// ============================================================================
// MAIN
// ============================================================================

try {
  runSynthesis();
} catch (err) {
  console.error('❌ Synthesis failed:', err.message);
  process.exit(1);
} EOF
