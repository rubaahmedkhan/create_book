# GitHub Pages Deployment Troubleshooting

Common issues and solutions for Docusaurus GitHub Pages deployments.

## Build Errors

### Error: Cannot find module '@docusaurus/...'

**Cause**: Dependencies not installed properly.

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm -rf */node_modules
rm package-lock.json
npm install
```

### Error: FATAL ERROR: Reached heap limit

**Cause**: Node.js running out of memory during build.

**Solution**:
```bash
# Increase Node memory
export NODE_OPTIONS="--max_old_space_size=8192"
npm run build
```

Or in package.json:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max_old_space_size=8192' docusaurus build"
  }
}
```

### Error: Cannot resolve path in sidebars

**Cause**: Sidebar references non-existent document.

**Solution**:
1. Check `sidebars.js` paths match actual files in `docs/`
2. Ensure document IDs in frontmatter match sidebar references
3. Run `npm run build` locally to identify specific missing files

## Deployment Errors

### 404 Page Not Found After Deployment

**Causes & Solutions**:

1. **Wrong baseUrl**
   ```javascript
   // Check docusaurus.config.js
   baseUrl: '/your-repo-name/',  // Must include leading and trailing /
   ```

2. **GitHub Pages not enabled**
   - Go to Settings > Pages
   - Source: GitHub Actions (not Deploy from branch)

3. **Jekyll processing**
   - Add `.nojekyll` file to static folder
   ```bash
   touch static/.nojekyll
   ```

4. **Wrong branch deployed**
   - Verify `gh-pages` branch exists
   - Or use GitHub Actions deployment

### CSS/Assets Not Loading

**Cause**: Asset paths not matching deployed URL.

**Solution**:
```javascript
// Ensure consistent config
url: 'https://username.github.io',
baseUrl: '/repo-name/',
```

Check browser console for 404 errors on assets.

### Deployment Action Failed: Permission Denied

**Cause**: GitHub Actions lacks write permissions.

**Solution**:
1. Go to Settings > Actions > General
2. Workflow permissions: Read and write permissions
3. Check "Allow GitHub Actions to create pull requests"

### Error: remote: Permission to repository denied

**Cause**: GITHUB_TOKEN lacks permissions.

**Solution**:
In workflow file:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## Multi-Instance Issues

### Module Links Return 404

**Cause**: Incorrect baseUrl in module config.

**Solution**:
Each module needs unique, correct baseUrl:
```javascript
// module1-ros2/docusaurus.config.js
baseUrl: '/physical-ai-textbook/module1/',

// module2-simulation/docusaurus.config.js
baseUrl: '/physical-ai-textbook/module2/',
```

### Modules Not Appearing at Subdirectories

**Cause**: Build output not merged correctly.

**Solution**:
Check GitHub Actions workflow:
```yaml
- name: Prepare deployment
  run: |
    mkdir -p ./deploy/module1
    cp -r ./module1-ros2/build/* ./deploy/module1/
```

### Shared Components Not Found

**Cause**: Workspace linking issues.

**Solution**:
```bash
# Rebuild workspace links
npm install

# Verify workspace
npm ls @shared/components
```

## Custom Domain Issues

### CNAME Gets Deleted on Deploy

**Cause**: CNAME not in static directory.

**Solution**:
```bash
# Create CNAME in static folder
echo "yourdomain.com" > static/CNAME
```

Or in workflow:
```yaml
- name: Add CNAME
  run: echo "yourdomain.com" > ./deploy/CNAME
```

### HTTPS Not Working

**Solution**:
1. Wait 24 hours for certificate provisioning
2. Go to Settings > Pages > Enforce HTTPS
3. Verify DNS records are correct

### DNS Not Resolving

**For apex domain:**
```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
```

**For subdomain:**
```
CNAME    docs    username.github.io.
```

## Performance Issues

### Build Takes Too Long

**Solutions**:

1. **Enable caching in workflow**:
```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      **/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

2. **Parallel builds** (for multi-instance):
```yaml
- name: Build all sites
  run: |
    npm run build --workspace=main-site &
    npm run build --workspace=module1-ros2 &
    npm run build --workspace=module2-simulation &
    wait
```

### Large Bundle Size

**Solutions**:
```javascript
// docusaurus.config.js
module.exports = {
  // Enable minification
  webpack: {
    jsLoader: (isServer) => ({
      loader: require.resolve('esbuild-loader'),
      options: {
        loader: 'tsx',
        target: isServer ? 'node12' : 'es2017',
      },
    }),
  },
};
```

## Debugging Tips

### Check Build Locally
```bash
npm run build
npm run serve
# Visit http://localhost:3000/your-base-url/
```

### Check GitHub Actions Logs
1. Go to Actions tab
2. Click on failed workflow run
3. Expand failed step
4. Look for error messages

### Verify Deployed Files
```bash
# Check what's deployed
git fetch origin gh-pages
git log origin/gh-pages --oneline -5
```

### Test with Different baseUrl
```bash
# Temporarily change baseUrl for testing
npm run build -- --config docusaurus.config.test.js
```

## Quick Reference

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| 404 on all pages | Wrong baseUrl | Match repo name |
| 404 on modules | Module baseUrl wrong | Add /module1/ etc |
| No CSS | Asset path mismatch | Check url + baseUrl |
| Build fails | Dependencies | npm ci |
| Deploy fails | Permissions | Enable write access |
| CNAME gone | Not in static/ | Add to static/CNAME |
