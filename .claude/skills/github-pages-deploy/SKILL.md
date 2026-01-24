---
name: github-pages-deploy
description: Complete deployment workflow for deploying Docusaurus multi-instance books to GitHub Pages. Use when users need to: (1) Deploy single or multi-instance Docusaurus sites to GitHub Pages, (2) Set up GitHub Actions CI/CD for automated deployment, (3) Configure custom domains for GitHub Pages, (4) Handle multi-module textbook deployments with proper routing, or (5) Troubleshoot GitHub Pages deployment issues.
---

# GitHub Pages Deployment for Docusaurus

Complete workflow for deploying Docusaurus multi-instance educational textbooks to GitHub Pages with GitHub Actions automation.

## Overview

This skill provides:

- **GitHub Actions CI/CD workflows** for automated deployment
- **Multi-instance deployment support** (main-site + module sites)
- **Custom domain configuration** with HTTPS
- **Build optimization** for production
- **Caching strategies** for faster builds
- **Troubleshooting guides** for common issues

## Prerequisites

- Node.js 20+ (LTS)
- npm 9+
- Git repository with Docusaurus project
- GitHub repository with Pages enabled
- Repository write access (for Actions)

## Quick Start

### Option 1: Single Site Deployment

```bash
# 1. Configure docusaurus.config.js
url: 'https://<username>.github.io',
baseUrl: '/<repo-name>/',
organizationName: '<username>',
projectName: '<repo-name>',

# 2. Copy workflow file
cp .claude/skills/github-pages-deploy/templates/deploy-single.yml .github/workflows/deploy.yml

# 3. Push to trigger deployment
git add . && git commit -m "Add deployment workflow" && git push
```

### Option 2: Multi-Instance Deployment (This Project)

```bash
# 1. Run setup script
node .claude/skills/github-pages-deploy/scripts/setup-deployment.js

# 2. Configure GitHub repository settings
# Settings > Pages > Source: GitHub Actions

# 3. Push changes
git add . && git commit -m "Configure GitHub Pages deployment" && git push
```

## Deployment Architecture

### Single Site Flow

```
main branch push
    └── GitHub Actions Workflow
        ├── Checkout code
        ├── Setup Node.js (cached)
        ├── Install dependencies (cached)
        ├── Build site (npm run build)
        └── Deploy to GitHub Pages
            └── https://<user>.github.io/<repo>/
```

### Multi-Instance Flow (This Project)

```
main branch push
    └── GitHub Actions Workflow
        ├── Checkout code
        ├── Setup Node.js (cached)
        ├── Install dependencies (cached)
        ├── Build all sites in parallel:
        │   ├── main-site → /physical-ai-textbook/
        │   ├── module1-ros2 → /physical-ai-textbook/module1/
        │   ├── module2-simulation → /physical-ai-textbook/module2/
        │   ├── module3-isaac → /physical-ai-textbook/module3/
        │   └── module4-vla → /physical-ai-textbook/module4/
        ├── Merge build outputs
        └── Deploy combined site to GitHub Pages
```

## Phase 1: Configuration Setup

### Step 1: Verify Docusaurus Config

Each Docusaurus instance needs these settings in `docusaurus.config.js`:

```javascript
const config = {
  // Production URL (your GitHub Pages URL)
  url: 'https://physical-ai-course.github.io',

  // Base path (repository name for project sites)
  baseUrl: '/physical-ai-textbook/',

  // GitHub deployment config
  organizationName: 'physical-ai-course', // GitHub org/username
  projectName: 'physical-ai-textbook',    // Repository name

  // Deployment branch (usually 'gh-pages')
  deploymentBranch: 'gh-pages',

  // Use trailing slash for consistency
  trailingSlash: false,

  // Error handling
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
};
```

### Step 2: Module-Specific baseUrl

For multi-instance deployments, each module needs unique baseUrl:

| Site | baseUrl | Final URL |
|------|---------|-----------|
| main-site | `/physical-ai-textbook/` | `https://...github.io/physical-ai-textbook/` |
| module1-ros2 | `/physical-ai-textbook/module1/` | `https://...github.io/physical-ai-textbook/module1/` |
| module2-simulation | `/physical-ai-textbook/module2/` | `https://...github.io/physical-ai-textbook/module2/` |
| module3-isaac | `/physical-ai-textbook/module3/` | `https://...github.io/physical-ai-textbook/module3/` |
| module4-vla | `/physical-ai-textbook/module4/` | `https://...github.io/physical-ai-textbook/module4/` |

See [references/docusaurus-config.md](references/docusaurus-config.md) for complete configuration examples.

## Phase 2: GitHub Actions Setup

### Step 1: Create Workflow Directory

```bash
mkdir -p .github/workflows
```

### Step 2: Copy Appropriate Workflow

For multi-instance deployment (this project):

```bash
cp .claude/skills/github-pages-deploy/templates/deploy-multi-instance.yml .github/workflows/deploy.yml
```

For single site deployment:

```bash
cp .claude/skills/github-pages-deploy/templates/deploy-single.yml .github/workflows/deploy.yml
```

### Step 3: Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** (left sidebar)
3. Under **Build and deployment**:
   - **Source**: Select `GitHub Actions`
4. Save changes

### Step 4: Configure Repository Permissions

1. Go to **Settings** > **Actions** > **General**
2. Scroll to **Workflow permissions**
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests**
5. Save

## Phase 3: Build Scripts

### Add Build Scripts to Root package.json

```json
{
  "scripts": {
    "build": "npm run build:all",
    "build:all": "npm run build:main && npm run build:modules",
    "build:main": "npm run build --workspace=main-site",
    "build:modules": "npm run build:module1 && npm run build:module2 && npm run build:module3 && npm run build:module4",
    "build:module1": "npm run build --workspace=module1-ros2",
    "build:module2": "npm run build --workspace=module2-simulation",
    "build:module3": "npm run build --workspace=module3-isaac",
    "build:module4": "npm run build --workspace=module4-vla",
    "build:deploy": "node .claude/skills/github-pages-deploy/scripts/build-for-deploy.js"
  }
}
```

## Phase 4: Deployment Verification

### Local Build Test

```bash
# Install dependencies
npm install

# Build all sites
npm run build:all

# Check build outputs
ls -la main-site/build/
ls -la module1-ros2/build/
ls -la module2-simulation/build/
ls -la module3-isaac/build/
ls -la module4-vla/build/
```

### Local Preview

```bash
# Serve main site build
npx serve main-site/build

# Or use Docusaurus serve
cd main-site && npm run serve
```

### Post-Deployment Verification

After GitHub Actions completes:

1. Check Actions tab for successful run
2. Visit your GitHub Pages URL
3. Verify all module links work
4. Test navigation between modules
5. Check assets load correctly (images, CSS, JS)

## Troubleshooting

See [references/troubleshooting.md](references/troubleshooting.md) for detailed solutions.

### Quick Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 on deployment | Wrong baseUrl | Verify baseUrl matches repo name |
| CSS not loading | Asset path mismatch | Check url and baseUrl in config |
| Module links broken | Cross-instance linking | Use absolute URLs for module links |
| Build fails | Node version | Ensure Node 20+ in workflow |
| Permissions denied | Actions permissions | Enable read/write in repo settings |

## Custom Domain Setup

### Step 1: Add CNAME

Create `static/CNAME` in main-site:

```
yourdomain.com
```

### Step 2: Configure DNS

Add these DNS records at your domain registrar:

**For apex domain (example.com):**
```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
```

**For subdomain (docs.example.com):**
```
CNAME    docs    <username>.github.io.
```

### Step 3: Update docusaurus.config.js

```javascript
url: 'https://yourdomain.com',
baseUrl: '/',  // Change to / for custom domain
```

### Step 4: Enable HTTPS

1. Go to **Settings** > **Pages**
2. Check **Enforce HTTPS**

## Resources

- **Templates**: [templates/](templates/)
  - `deploy-single.yml` - Single site workflow
  - `deploy-multi-instance.yml` - Multi-instance workflow
- **Scripts**: [scripts/](scripts/)
  - `setup-deployment.js` - Automated setup
  - `build-for-deploy.js` - Build merger script
- **References**: [references/](references/)
  - `docusaurus-config.md` - Configuration guide
  - `troubleshooting.md` - Common issues
  - `custom-domain.md` - Domain setup guide

## External Resources

- [Docusaurus Deployment Docs](https://docusaurus.io/docs/deployment)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions for Pages](https://github.com/actions/deploy-pages)
