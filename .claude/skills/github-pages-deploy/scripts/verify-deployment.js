#!/usr/bin/env node

/**
 * Verify Deployment Script
 *
 * Checks if the Docusaurus configuration is correctly set up for GitHub Pages deployment.
 *
 * Usage:
 *   node verify-deployment.js [options]
 *
 * Options:
 *   --fix         Attempt to fix common issues
 *   --verbose     Show detailed output
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SITES = [
  { name: 'main-site', expectedBaseUrl: '/physical-ai-textbook/' },
  { name: 'module1-ros2', expectedBaseUrl: '/physical-ai-textbook/module1/' },
  { name: 'module2-simulation', expectedBaseUrl: '/physical-ai-textbook/module2/' },
  { name: 'module3-isaac', expectedBaseUrl: '/physical-ai-textbook/module3/' },
  { name: 'module4-vla', expectedBaseUrl: '/physical-ai-textbook/module4/' },
];

const REQUIRED_CONFIG = {
  url: 'https://physical-ai-course.github.io',
  organizationName: 'physical-ai-course',
  projectName: 'physical-ai-textbook',
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose'),
  };
}

// Find project root
function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (
      fs.existsSync(path.join(dir, 'package.json')) &&
      fs.existsSync(path.join(dir, 'main-site'))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

// Extract config values from docusaurus.config.js
function extractConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    return null;
  }

  const content = fs.readFileSync(configPath, 'utf8');

  const extract = (key) => {
    const match = content.match(new RegExp(`${key}:\\s*['"]([^'"]*)['"']`));
    return match ? match[1] : null;
  };

  return {
    url: extract('url'),
    baseUrl: extract('baseUrl'),
    organizationName: extract('organizationName'),
    projectName: extract('projectName'),
  };
}

// Check a single site configuration
function checkSite(projectRoot, site, options) {
  const configPath = path.join(projectRoot, site.name, 'docusaurus.config.js');
  const issues = [];
  const warnings = [];

  console.log(`\n📦 Checking ${site.name}...`);

  if (!fs.existsSync(configPath)) {
    issues.push(`Config file not found: ${configPath}`);
    return { issues, warnings };
  }

  const config = extractConfig(configPath);

  if (!config) {
    issues.push('Could not parse configuration');
    return { issues, warnings };
  }

  // Check URL
  if (config.url !== REQUIRED_CONFIG.url) {
    issues.push(`url: "${config.url}" should be "${REQUIRED_CONFIG.url}"`);
  }

  // Check baseUrl
  if (config.baseUrl !== site.expectedBaseUrl) {
    issues.push(
      `baseUrl: "${config.baseUrl}" should be "${site.expectedBaseUrl}"`
    );
  }

  // Check organizationName
  if (config.organizationName !== REQUIRED_CONFIG.organizationName) {
    issues.push(
      `organizationName: "${config.organizationName}" should be "${REQUIRED_CONFIG.organizationName}"`
    );
  }

  // Check projectName
  if (config.projectName !== REQUIRED_CONFIG.projectName) {
    issues.push(
      `projectName: "${config.projectName}" should be "${REQUIRED_CONFIG.projectName}"`
    );
  }

  // Check for static files
  const staticDir = path.join(projectRoot, site.name, 'static');
  if (site.name === 'main-site') {
    const nojekyllPath = path.join(staticDir, '.nojekyll');
    if (!fs.existsSync(nojekyllPath)) {
      warnings.push('Missing .nojekyll file in static directory');
    }
  }

  if (options.verbose) {
    console.log('  Current config:');
    console.log(`    url: "${config.url}"`);
    console.log(`    baseUrl: "${config.baseUrl}"`);
    console.log(`    organizationName: "${config.organizationName}"`);
    console.log(`    projectName: "${config.projectName}"`);
  }

  return { issues, warnings };
}

// Check GitHub Actions workflow
function checkWorkflow(projectRoot) {
  const workflowPath = path.join(projectRoot, '.github', 'workflows', 'deploy.yml');
  const issues = [];
  const warnings = [];

  console.log('\n📋 Checking GitHub Actions workflow...');

  if (!fs.existsSync(workflowPath)) {
    issues.push('Workflow file not found: .github/workflows/deploy.yml');
    return { issues, warnings };
  }

  const content = fs.readFileSync(workflowPath, 'utf8');

  // Check for required permissions
  if (!content.includes('pages: write')) {
    issues.push('Missing "pages: write" permission in workflow');
  }

  if (!content.includes('id-token: write')) {
    issues.push('Missing "id-token: write" permission in workflow');
  }

  // Check for Node version
  if (!content.includes("node-version: '20'") && !content.includes('node-version: "20"')) {
    warnings.push('Consider using Node.js 20 for builds');
  }

  // Check for deploy-pages action
  if (!content.includes('deploy-pages')) {
    issues.push('Missing deploy-pages action');
  }

  console.log('  ✅ Workflow file exists');

  return { issues, warnings };
}

// Check build directories exist
function checkBuilds(projectRoot) {
  const issues = [];
  const warnings = [];

  console.log('\n🔨 Checking build directories...');

  for (const site of SITES) {
    const buildPath = path.join(projectRoot, site.name, 'build');
    if (!fs.existsSync(buildPath)) {
      warnings.push(`Build not found for ${site.name} (run npm run build first)`);
    } else {
      console.log(`  ✅ ${site.name}/build exists`);
    }
  }

  return { issues, warnings };
}

// Main function
async function main() {
  const options = parseArgs();
  const projectRoot = findProjectRoot();

  console.log('\n🔍 Deployment Verification\n');
  console.log(`Project root: ${projectRoot}`);

  let totalIssues = [];
  let totalWarnings = [];

  // Check all sites
  for (const site of SITES) {
    const { issues, warnings } = checkSite(projectRoot, site, options);
    totalIssues = totalIssues.concat(issues.map((i) => `[${site.name}] ${i}`));
    totalWarnings = totalWarnings.concat(
      warnings.map((w) => `[${site.name}] ${w}`)
    );

    if (issues.length === 0) {
      console.log('  ✅ Configuration OK');
    } else {
      for (const issue of issues) {
        console.log(`  ❌ ${issue}`);
      }
    }
  }

  // Check workflow
  const workflowResult = checkWorkflow(projectRoot);
  totalIssues = totalIssues.concat(
    workflowResult.issues.map((i) => `[workflow] ${i}`)
  );
  totalWarnings = totalWarnings.concat(
    workflowResult.warnings.map((w) => `[workflow] ${w}`)
  );

  // Check builds
  const buildResult = checkBuilds(projectRoot);
  totalWarnings = totalWarnings.concat(buildResult.warnings);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Summary\n');

  if (totalIssues.length > 0) {
    console.log('❌ Issues found:\n');
    for (const issue of totalIssues) {
      console.log(`  • ${issue}`);
    }
  }

  if (totalWarnings.length > 0) {
    console.log('\n⚠️  Warnings:\n');
    for (const warning of totalWarnings) {
      console.log(`  • ${warning}`);
    }
  }

  if (totalIssues.length === 0 && totalWarnings.length === 0) {
    console.log('✅ All checks passed! Ready for deployment.\n');
  } else if (totalIssues.length === 0) {
    console.log(
      '\n✅ No critical issues. Ready for deployment (with warnings).\n'
    );
  } else {
    console.log('\n❌ Please fix the issues above before deploying.\n');

    if (options.fix) {
      console.log('💡 Run with --fix to attempt automatic fixes.\n');
    }
  }

  console.log('='.repeat(50) + '\n');

  process.exit(totalIssues.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('\n❌ Verification failed:', error.message);
  process.exit(1);
});
