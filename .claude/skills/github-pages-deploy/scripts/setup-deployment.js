#!/usr/bin/env node

/**
 * GitHub Pages Deployment Setup Script
 *
 * Automates the setup of GitHub Pages deployment for multi-instance Docusaurus projects.
 *
 * Usage:
 *   node setup-deployment.js [options]
 *
 * Options:
 *   --org <name>        GitHub organization/username (default: from config)
 *   --repo <name>       Repository name (default: from config)
 *   --domain <domain>   Custom domain (optional)
 *   --dry-run           Show what would be done without making changes
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Default values (update these for your project)
  defaultOrg: 'physical-ai-course',
  defaultRepo: 'physical-ai-textbook',

  // Site directories
  sites: [
    { name: 'main-site', baseUrl: '/', isMain: true },
    { name: 'module1-ros2', baseUrl: '/module1/', isMain: false },
    { name: 'module2-simulation', baseUrl: '/module2/', isMain: false },
    { name: 'module3-isaac', baseUrl: '/module3/', isMain: false },
    { name: 'module4-vla', baseUrl: '/module4/', isMain: false },
  ],

  // Workflow template path
  workflowTemplate: path.join(
    __dirname,
    '..',
    'templates',
    'deploy-multi-instance.yml'
  ),

  // Output paths
  workflowOutput: '.github/workflows/deploy.yml',
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    org: CONFIG.defaultOrg,
    repo: CONFIG.defaultRepo,
    domain: null,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--org':
        options.org = args[++i];
        break;
      case '--repo':
        options.repo = args[++i];
        break;
      case '--domain':
        options.domain = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
GitHub Pages Deployment Setup Script

Usage:
  node setup-deployment.js [options]

Options:
  --org <name>        GitHub organization/username
  --repo <name>       Repository name
  --domain <domain>   Custom domain (optional)
  --dry-run           Show what would be done without making changes
  --help              Show this help message

Example:
  node setup-deployment.js --org my-org --repo my-docs
  node setup-deployment.js --domain docs.example.com --dry-run
`);
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

// Update docusaurus.config.js for a site
function updateDocusaurusConfig(sitePath, options, site) {
  const configPath = path.join(sitePath, 'docusaurus.config.js');

  if (!fs.existsSync(configPath)) {
    console.log(`  ⚠️  Config not found: ${configPath}`);
    return false;
  }

  let config = fs.readFileSync(configPath, 'utf8');

  // Build the URL
  const url = options.domain
    ? `https://${options.domain}`
    : `https://${options.org}.github.io`;

  // Build the baseUrl
  const baseUrl = options.domain
    ? site.baseUrl
    : `/${options.repo}${site.baseUrl}`;

  // Replace URL
  config = config.replace(
    /url:\s*['"][^'"]*['"]/,
    `url: '${url}'`
  );

  // Replace baseUrl
  config = config.replace(
    /baseUrl:\s*['"][^'"]*['"]/,
    `baseUrl: '${baseUrl}'`
  );

  // Replace organizationName
  config = config.replace(
    /organizationName:\s*['"][^'"]*['"]/,
    `organizationName: '${options.org}'`
  );

  // Replace projectName
  config = config.replace(
    /projectName:\s*['"][^'"]*['"]/,
    `projectName: '${options.repo}'`
  );

  if (options.dryRun) {
    console.log(`  📝 Would update: ${configPath}`);
    console.log(`     url: '${url}'`);
    console.log(`     baseUrl: '${baseUrl}'`);
  } else {
    fs.writeFileSync(configPath, config);
    console.log(`  ✅ Updated: ${configPath}`);
  }

  return true;
}

// Copy workflow file
function setupWorkflow(projectRoot, options) {
  const workflowDir = path.join(projectRoot, '.github', 'workflows');
  const workflowPath = path.join(projectRoot, CONFIG.workflowOutput);

  if (options.dryRun) {
    console.log(`\n📝 Would create: ${workflowPath}`);
    return true;
  }

  // Create directory
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }

  // Copy template
  if (fs.existsSync(CONFIG.workflowTemplate)) {
    fs.copyFileSync(CONFIG.workflowTemplate, workflowPath);
    console.log(`\n✅ Created workflow: ${workflowPath}`);
  } else {
    console.log(`\n⚠️  Template not found: ${CONFIG.workflowTemplate}`);
    return false;
  }

  return true;
}

// Create CNAME file for custom domain
function setupCNAME(projectRoot, options) {
  if (!options.domain) return true;

  const cnamePath = path.join(projectRoot, 'main-site', 'static', 'CNAME');

  if (options.dryRun) {
    console.log(`\n📝 Would create: ${cnamePath}`);
    console.log(`   Content: ${options.domain}`);
    return true;
  }

  // Ensure static directory exists
  const staticDir = path.dirname(cnamePath);
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  fs.writeFileSync(cnamePath, options.domain);
  console.log(`\n✅ Created CNAME: ${cnamePath}`);

  return true;
}

// Create .nojekyll file
function setupNoJekyll(projectRoot, options) {
  const noJekyllPath = path.join(projectRoot, 'main-site', 'static', '.nojekyll');

  if (options.dryRun) {
    console.log(`📝 Would create: ${noJekyllPath}`);
    return true;
  }

  const staticDir = path.dirname(noJekyllPath);
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  fs.writeFileSync(noJekyllPath, '');
  console.log(`✅ Created .nojekyll: ${noJekyllPath}`);

  return true;
}

// Main function
async function main() {
  const options = parseArgs();
  const projectRoot = findProjectRoot();

  console.log('\n🚀 GitHub Pages Deployment Setup\n');
  console.log(`Project root: ${projectRoot}`);
  console.log(`Organization: ${options.org}`);
  console.log(`Repository:   ${options.repo}`);
  if (options.domain) {
    console.log(`Custom domain: ${options.domain}`);
  }
  if (options.dryRun) {
    console.log('\n⚠️  DRY RUN - No changes will be made\n');
  }

  // Update all site configs
  console.log('\n📦 Updating Docusaurus configurations...\n');

  for (const site of CONFIG.sites) {
    const sitePath = path.join(projectRoot, site.name);
    if (fs.existsSync(sitePath)) {
      updateDocusaurusConfig(sitePath, options, site);
    } else {
      console.log(`  ⚠️  Site not found: ${site.name}`);
    }
  }

  // Setup workflow
  console.log('\n📋 Setting up GitHub Actions workflow...');
  setupWorkflow(projectRoot, options);

  // Setup CNAME if custom domain
  if (options.domain) {
    console.log('\n🌐 Setting up custom domain...');
    setupCNAME(projectRoot, options);
  }

  // Setup .nojekyll
  console.log('\n📄 Setting up Jekyll bypass...');
  setupNoJekyll(projectRoot, options);

  // Print next steps
  console.log('\n' + '='.repeat(50));
  console.log('\n✨ Setup complete! Next steps:\n');
  console.log('1. Review the changes made to docusaurus.config.js files');
  console.log('2. Go to GitHub repo Settings > Pages');
  console.log('3. Set Source to "GitHub Actions"');
  console.log('4. Commit and push changes:');
  console.log('   git add .');
  console.log('   git commit -m "Configure GitHub Pages deployment"');
  console.log('   git push');
  console.log('\n5. Check Actions tab for deployment status');

  if (options.domain) {
    console.log(`\n6. Configure DNS for ${options.domain}`);
    console.log('   See: references/custom-domain.md');
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

main().catch(console.error);
