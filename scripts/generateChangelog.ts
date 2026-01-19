#!/usr/bin/env node
// Generate changelog from git commits
// scripts/generateChangelog.ts

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface Commit {
  hash: string;
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  breaking: boolean;
  author: string;
  date: Date;
}

interface ChangelogSection {
  title: string;
  commits: Commit[];
}

/**
 * Changelog Generator
 * 
 * Generates CHANGELOG.md based on:
 * - Conventional Commits
 * - Git history
 * - Semantic versioning
 */
class ChangelogGenerator {
  private lastTag: string = '';
  private currentVersion: string = '';

  constructor() {
    this.lastTag = this.getLastTag();
    this.currentVersion = process.argv[2] || this.generateVersion();
  }

  private getLastTag(): string {
    try {
      return execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
    } catch (_error) {
      return '';
    }
  }

  private generateVersion(): string {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    return packageJson.version;
  }

  private getCommitsSinceTag(): string[] {
    try {
      const range = this.lastTag ? `${this.lastTag}..HEAD` : 'HEAD';
      const format = '%H|%s|%b|%an|%ad';
      const commits = execSync(`git log ${range} --pretty=format:"${format}" --date=short`, {
        encoding: 'utf-8',
      });
      return commits.split('\n').filter(Boolean);
    } catch (_error) {
      console.error('Error getting commits:', error);
      return [];
    }
  }

  private parseCommit(commitLine: string): Commit | null {
    const [hash, subject, body, author, date] = commitLine.split('|');
    
    // Parse conventional commit format
    const conventionalRegex = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;
    const match = subject.match(conventionalRegex);

    if (!match) {
      // Not a conventional commit, skip or add to uncategorized
      return null;
    }

    const [, type, scope, breaking, commitSubject] = match;

    return {
      hash: hash.substring(0, 7),
      type: type.toLowerCase(),
      scope,
      subject: commitSubject,
      body,
      breaking: breaking === '!' || body.includes('BREAKING CHANGE'),
      author,
      date: new Date(date),
    };
  }

  private categorizeCommits(commits: Commit[]): ChangelogSection[] {
    const sections: Map<string, Commit[]> = new Map();

    // Define section order and titles
    const sectionConfig: Record<string, string> = {
      breaking: '🚨 BREAKING CHANGES',
      feat: '✨ Features',
      fix: '🐛 Bug Fixes',
      perf: '⚡ Performance',
      refactor: '♻️ Refactoring',
      docs: '📝 Documentation',
      test: '✅ Tests',
      chore: '🔧 Chores',
      style: '💎 Styling',
      build: '📦 Build',
      ci: '👷 CI/CD',
    };

    // Categorize commits
    commits.forEach((commit) => {
      if (commit.breaking) {
        if (!sections.has('breaking')) sections.set('breaking', []);
        sections.get('breaking')!.push(commit);
      } else {
        if (!sections.has(commit.type)) sections.set(commit.type, []);
        sections.get(commit.type)!.push(commit);
      }
    });

    // Convert to array with titles
    const result: ChangelogSection[] = [];
    
    Object.entries(sectionConfig).forEach(([type, title]) => {
      if (sections.has(type)) {
        result.push({
          title,
          commits: sections.get(type)!,
        });
      }
    });

    return result;
  }

  private formatCommit(commit: Commit): string {
    const scope = commit.scope ? `**${commit.scope}**: ` : '';
    const breaking = commit.breaking ? ' ⚠️ ' : '';
    return `- ${scope}${commit.subject}${breaking} ([\`${commit.hash}\`](../../commit/${commit.hash}))`;
  }

  private generateMarkdown(sections: ChangelogSection[]): string {
    const date = new Date().toISOString().split('T')[0];
    const compareUrl = this.lastTag
      ? `https://github.com/sandoo777/sanduta.art/compare/${this.lastTag}...v${this.currentVersion}`
      : '';

    let markdown = `# Changelog\n\n`;
    markdown += `## [${this.currentVersion}](${compareUrl}) (${date})\n\n`;

    if (sections.length === 0) {
      markdown += `No significant changes.\n\n`;
      return markdown;
    }

    sections.forEach((section) => {
      markdown += `### ${section.title}\n\n`;
      section.commits.forEach((commit) => {
        markdown += `${this.formatCommit(commit)}\n`;
      });
      markdown += `\n`;
    });

    return markdown;
  }

  private prependToChangelog(newContent: string): void {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    let existingContent = '';

    if (fs.existsSync(changelogPath)) {
      existingContent = fs.readFileSync(changelogPath, 'utf-8');
      // Remove the header from existing content
      const lines = existingContent.split('\n');
      if (lines[0] === '# Changelog') {
        lines.shift(); // Remove "# Changelog"
        if (lines[0] === '') lines.shift(); // Remove empty line
        existingContent = lines.join('\n');
      }
    }

    const fullContent = newContent + existingContent;
    fs.writeFileSync(changelogPath, fullContent);
    console.log('✅ CHANGELOG.md updated');
  }

  public generate(): void {
    console.log(`Generating changelog for version ${this.currentVersion}...`);
    console.log(`Last tag: ${this.lastTag || 'none'}`);

    // Get commits
    const commitLines = this.getCommitsSinceTag();
    console.log(`Found ${commitLines.length} commits`);

    // Parse commits
    const commits = commitLines
      .map((line) => this.parseCommit(line))
      .filter((commit): commit is Commit => commit !== null);

    console.log(`Parsed ${commits.length} conventional commits`);

    // Categorize
    const sections = this.categorizeCommits(commits);

    // Generate markdown
    const markdown = this.generateMarkdown(sections);

    // Write to file
    this.prependToChangelog(markdown);

    // Also output to console for CI/CD
    console.log('\n--- Generated Changelog ---\n');
    console.log(markdown);
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new ChangelogGenerator();
  generator.generate();
}

export { ChangelogGenerator };
