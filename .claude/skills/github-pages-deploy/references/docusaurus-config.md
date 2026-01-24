# Docusaurus Configuration for GitHub Pages

Complete configuration reference for deploying Docusaurus to GitHub Pages.

## Configuration Overview

### Required Settings

```javascript
// docusaurus.config.js
const config = {
  // REQUIRED: Production URL
  url: 'https://<username>.github.io',

  // REQUIRED: Base URL path
  // For project sites: '/<repo-name>/'
  // For user/org sites: '/'
  baseUrl: '/<repo-name>/',

  // REQUIRED for deployment command
  organizationName: '<username-or-org>',
  projectName: '<repo-name>',

  // Optional but recommended
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
};
```

## URL Types

### User/Organization Site
```
URL Pattern: https://<username>.github.io/
Repository Name: <username>.github.io

Config:
  url: 'https://<username>.github.io',
  baseUrl: '/',
```

### Project Site
```
URL Pattern: https://<username>.github.io/<repo-name>/
Repository Name: <any-name>

Config:
  url: 'https://<username>.github.io',
  baseUrl: '/<repo-name>/',
```

## Multi-Instance Configuration

For projects with multiple Docusaurus sites, each needs unique baseUrl:

### Main Site (Root)
```javascript
// main-site/docusaurus.config.js
const config = {
  url: 'https://physical-ai-course.github.io',
  baseUrl: '/physical-ai-textbook/',
  organizationName: 'physical-ai-course',
  projectName: 'physical-ai-textbook',
};
```

### Module Sites (Subdirectories)
```javascript
// module1-ros2/docusaurus.config.js
const config = {
  url: 'https://physical-ai-course.github.io',
  baseUrl: '/physical-ai-textbook/module1/',
  organizationName: 'physical-ai-course',
  projectName: 'physical-ai-textbook',
};

// module2-simulation/docusaurus.config.js
const config = {
  url: 'https://physical-ai-course.github.io',
  baseUrl: '/physical-ai-textbook/module2/',
  organizationName: 'physical-ai-course',
  projectName: 'physical-ai-textbook',
};

// Repeat for module3, module4...
```

## Environment Variables for CI/CD

```yaml
# In GitHub Actions workflow
env:
  GIT_USER: git
  GIT_PASS: ${{ secrets.GITHUB_TOKEN }}
  DEPLOYMENT_BRANCH: gh-pages
```

## Cross-Instance Linking

When linking between modules, use absolute URLs:

```markdown
<!-- In main-site, linking to module1 -->
[ROS 2 Module](/physical-ai-textbook/module1/)

<!-- In module1, linking to main site -->
[Back to Course](/physical-ai-textbook/)

<!-- In module2, linking to module1 -->
[See ROS 2 Prerequisites](/physical-ai-textbook/module1/prerequisites)
```

Or use the full URL for external references:
```markdown
[Module 1](https://physical-ai-course.github.io/physical-ai-textbook/module1/)
```

## Static Assets Configuration

### Image Paths
```markdown
<!-- Use absolute paths from baseUrl -->
![Logo](/img/logo.png)

<!-- Or relative to current doc -->
![Diagram](./images/diagram.png)
```

### CNAME for Custom Domain
Create `static/CNAME` file (no extension):
```
yourdomain.com
```

## Build Output Structure

After running `npm run build`:

```
project/
├── main-site/
│   └── build/           # → /physical-ai-textbook/
├── module1-ros2/
│   └── build/           # → /physical-ai-textbook/module1/
├── module2-simulation/
│   └── build/           # → /physical-ai-textbook/module2/
├── module3-isaac/
│   └── build/           # → /physical-ai-textbook/module3/
└── module4-vla/
    └── build/           # → /physical-ai-textbook/module4/
```

## Configuration Checklist

- [ ] `url` matches GitHub Pages URL
- [ ] `baseUrl` starts and ends with `/`
- [ ] `organizationName` matches GitHub username/org
- [ ] `projectName` matches repository name
- [ ] All module `baseUrl` values are unique
- [ ] Cross-instance links use correct paths
- [ ] `static/CNAME` exists (if using custom domain)
- [ ] `.nojekyll` file in build output
