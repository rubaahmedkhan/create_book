#!/usr/bin/env node

/**
 * Build for Deploy Script
 *
 * Builds all Docusaurus instances and merges them into a single deploy directory.
 *
 * Usage:
 *   node build-for-deploy.js [options]
 *
 * Options:
 *   --output <dir>     Output directory (default: ./deploy)
 *   --parallel         Build sites in parallel
 *   --skip-build       Skip build step (only merge existing builds)
 *   --clean            Clean output directory before merge
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const SITES = [
  { name: 'main-site', deployPath: '/', buildDir: 'build' },
  { name: 'module1-ros2', deployPath: '/module1', buildDir: 'build' },
  { name: 'module2-simulation', deployPath: '/module2', buildDir: 'build' },
  { name: 'module3-isaac', deployPath: '/module3', buildDir: 'build' },
  { name: 'module4-vla', deployPath: '/module4', buildDir: 'build' },
];

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    output: './deploy',
    parallel: false,
    skipBuild: false,
    clean: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--output':
        options.output = args[++i];
        break;
      case '--parallel':
        options.parallel = true;
        break;
      case '--skip-build':
        options.skipBuild = true;
        break;
      case '--clean':
        options.clean = true;
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
Build for Deploy Script

Builds all Docusaurus instances and merges them into a single deploy directory.

Usage:
  node build-for-deploy.js [options]

Options:
  --output <dir>     Output directory (default: ./deploy)
  --parallel         Build sites in parallel
  --skip-build       Skip build step (only merge existing builds)
  --clean            Clean output directory before merge
  --help             Show this help message

Example:
  node build-for-deploy.js --parallel --clean
  node build-for-deploy.js --skip-build --output ./dist
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

// Build a single site
function buildSite(projectRoot, site) {
  return new Promise((resolve, reject) => {
    const sitePath = path.join(projectRoot, site.name);

    if (!fs.existsSync(sitePath)) {
      console.log(`  ⚠️  Site not found: ${site.name}`);
      resolve(false);
      return;
    }

    console.log(`  🔨 Building ${site.name}...`);

    try {
      execSync('npm run build', {
        cwd: sitePath,
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_OPTIONS: '--max_old_space_size=8192',
        },
      });
      console.log(`  ✅ Built ${site.name}`);
      resolve(true);
    } catch (error) {
      console.error(`  ❌ Failed to build ${site.name}:`, error.message);
      reject(error);
    }
  });
}

// Build all sites sequentially
async function buildSequential(projectRoot) {
  for (const site of SITES) {
    await buildSite(projectRoot, site);
  }
}

// Build all sites in parallel
async function buildParallel(projectRoot) {
  const promises = SITES.map((site) => buildSite(projectRoot, site));
  await Promise.all(promises);
}

// Copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return false;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  return true;
}

// Remove directory recursively
function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Merge all builds into deploy directory
function mergeBuildOutputs(projectRoot, outputDir) {
  console.log(`\n📦 Merging build outputs to ${outputDir}...\n`);

  for (const site of SITES) {
    const buildPath = path.join(projectRoot, site.name, site.buildDir);
    const deployPath = path.join(outputDir, site.deployPath);

    if (!fs.existsSync(buildPath)) {
      console.log(`  ⚠️  Build not found: ${buildPath}`);
      continue;
    }

    console.log(`  📁 Copying ${site.name} → ${site.deployPath}`);
    copyDir(buildPath, deployPath);
  }

  // Create .nojekyll
  const nojekyllPath = path.join(outputDir, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '');
  console.log(`  📄 Created .nojekyll`);

  // Check for CNAME in main-site static
  const mainCnamePath = path.join(projectRoot, 'main-site', 'static', 'CNAME');
  if (fs.existsSync(mainCnamePath)) {
    const cname = fs.readFileSync(mainCnamePath, 'utf8');
    fs.writeFileSync(path.join(outputDir, 'CNAME'), cname);
    console.log(`  🌐 Copied CNAME: ${cname.trim()}`);
  }
}

// Print deployment structure
function printStructure(outputDir) {
  console.log('\n📋 Deployment structure:\n');

  function listDir(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).slice(0, 5);
    const files = entries.filter((e) => e.isFile()).slice(0, 5);

    for (const entry of [...dirs, ...files]) {
      const symbol = entry.isDirectory() ? '📁' : '📄';
      console.log(`${prefix}${symbol} ${entry.name}`);
    }

    if (entries.length > 10) {
      console.log(`${prefix}... and ${entries.length - 10} more`);
    }
  }

  listDir(outputDir);

  // Show module directories
  for (const site of SITES) {
    if (site.deployPath !== '/') {
      const modulePath = path.join(outputDir, site.deployPath);
      if (fs.existsSync(modulePath)) {
        console.log(`\n${site.deployPath}/`);
        listDir(modulePath, '  ');
      }
    }
  }
}

// Main function
async function main() {
  const options = parseArgs();
  const projectRoot = findProjectRoot();
  const outputDir = path.resolve(projectRoot, options.output);

  console.log('\n🚀 Build for Deploy\n');
  console.log(`Project root: ${projectRoot}`);
  console.log(`Output: ${outputDir}`);

  // Clean output directory
  if (options.clean) {
    console.log('\n🧹 Cleaning output directory...');
    removeDir(outputDir);
  }

  // Build sites
  if (!options.skipBuild) {
    console.log('\n🔨 Building sites...\n');

    if (options.parallel) {
      console.log('  (parallel mode)\n');
      await buildParallel(projectRoot);
    } else {
      await buildSequential(projectRoot);
    }
  } else {
    console.log('\n⏭️  Skipping build step');
  }

  // Merge outputs
  mergeBuildOutputs(projectRoot, outputDir);

  // Print structure
  printStructure(outputDir);

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('\n✨ Build complete!\n');
  console.log(`Output directory: ${outputDir}`);
  console.log('\nTo test locally:');
  console.log(`  npx serve ${options.output}`);
  console.log('\nTo deploy:');
  console.log('  git add . && git commit -m "Build for deployment" && git push');
  console.log('\n' + '='.repeat(50) + '\n');
}

main().catch((error) => {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
});
