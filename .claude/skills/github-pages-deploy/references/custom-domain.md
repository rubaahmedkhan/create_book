# Custom Domain Setup for GitHub Pages

Complete guide for configuring custom domains with GitHub Pages Docusaurus deployment.

## Overview

GitHub Pages supports two types of custom domains:

1. **Apex domain**: `example.com`
2. **Subdomain**: `docs.example.com` or `www.example.com`

## Step 1: Choose Domain Type

### Subdomain (Recommended)
```
docs.example.com
www.example.com
blog.example.com
```

**Advantages**:
- Faster DNS propagation
- Better CDN performance
- Easier SSL certificate provisioning

### Apex Domain
```
example.com
```

**Use when**: You want the root domain for documentation.

## Step 2: Configure DNS

### For Subdomain

Add CNAME record at your DNS provider:

| Type | Name | Value |
|------|------|-------|
| CNAME | docs | `<username>.github.io.` |
| CNAME | www | `<username>.github.io.` |

**Example for Cloudflare:**
```
Type:    CNAME
Name:    docs
Content: physical-ai-course.github.io
Proxy:   DNS only (gray cloud)
```

### For Apex Domain

Add A records pointing to GitHub's servers:

| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

Optional: Add AAAA records for IPv6:
| Type | Name | Value |
|------|------|-------|
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |

## Step 3: Add CNAME File

Create `static/CNAME` in your Docusaurus project:

```bash
# For main-site
echo "docs.example.com" > main-site/static/CNAME
```

**Important**:
- No `http://` or `https://`
- No trailing slash
- File has no extension

## Step 4: Update Docusaurus Config

```javascript
// docusaurus.config.js
const config = {
  // Change to your custom domain
  url: 'https://docs.example.com',

  // Change to root for custom domain
  baseUrl: '/',

  // Keep these for reference
  organizationName: 'physical-ai-course',
  projectName: 'physical-ai-textbook',
};
```

### For Multi-Instance with Custom Domain

```javascript
// main-site/docusaurus.config.js
url: 'https://docs.example.com',
baseUrl: '/',

// module1-ros2/docusaurus.config.js
url: 'https://docs.example.com',
baseUrl: '/module1/',

// module2-simulation/docusaurus.config.js
url: 'https://docs.example.com',
baseUrl: '/module2/',
```

## Step 5: Configure GitHub Repository

1. Go to **Settings** > **Pages**
2. Under **Custom domain**:
   - Enter your domain: `docs.example.com`
   - Click **Save**
3. Wait for DNS check (green checkmark)
4. Enable **Enforce HTTPS** (after DNS verifies)

## Step 6: Update GitHub Actions Workflow

Add CNAME to deployment:

```yaml
- name: Prepare deployment
  run: |
    mkdir -p ./deploy
    cp -r ./main-site/build/* ./deploy/
    # ... copy modules ...

    # Add CNAME for custom domain
    echo "docs.example.com" > ./deploy/CNAME

    # Add .nojekyll
    touch ./deploy/.nojekyll
```

## SSL Certificate

GitHub automatically provisions Let's Encrypt SSL certificates for custom domains.

**Timeline**:
- HTTPS available: 15-30 minutes after DNS verification
- Full propagation: Up to 24 hours

**If HTTPS not working**:
1. Verify DNS records are correct
2. Disable and re-enable custom domain in settings
3. Wait 24 hours
4. Check for CAA records blocking Let's Encrypt

## DNS Provider Examples

### Cloudflare
```
Type:    CNAME
Name:    docs
Target:  physical-ai-course.github.io
Proxy:   OFF (important!)
```

**Note**: Disable Cloudflare proxy (orange cloud) for GitHub Pages.

### GoDaddy
```
Type:    CNAME
Name:    docs
Value:   physical-ai-course.github.io
TTL:     1 Hour
```

### Namecheap
```
Type:    CNAME Record
Host:    docs
Value:   physical-ai-course.github.io.
TTL:     Automatic
```

### Google Domains
```
Host name:  docs
Type:       CNAME
TTL:        1h
Data:       physical-ai-course.github.io.
```

## Verification

### Check DNS Propagation
```bash
# Check CNAME
dig docs.example.com CNAME

# Check A records
dig example.com A

# Use online tool
# https://www.whatsmydns.net/
```

### Check SSL Certificate
```bash
# Check HTTPS
curl -I https://docs.example.com

# Check certificate
echo | openssl s_client -connect docs.example.com:443 2>/dev/null | openssl x509 -noout -dates
```

## Troubleshooting

### "Domain not properly configured"

1. Verify DNS records match GitHub requirements
2. Wait for DNS propagation (up to 48 hours)
3. Remove and re-add custom domain in settings

### "Certificate provisioning failed"

1. Check for conflicting CAA DNS records
2. Ensure no Cloudflare proxy (orange cloud)
3. Try removing and re-adding domain

### HTTPS Mixed Content Warnings

Update all hardcoded URLs in your content:
```javascript
// Bad
<img src="http://example.com/image.png" />

// Good
<img src="https://example.com/image.png" />
// Or relative
<img src="/img/image.png" />
```

### Redirect www to apex (or vice versa)

Add both CNAME records and configure in GitHub:
1. Settings > Pages > Custom domain
2. Enter primary domain
3. GitHub handles www redirect automatically

## Multi-Domain Setup

For separate domains per module (advanced):

```
docs.example.com       → main-site
ros2.example.com       → module1-ros2
simulation.example.com → module2-simulation
```

**Requires**: Separate GitHub repositories per module (not recommended for this project).

## Best Practices

1. **Use subdomain** over apex domain for reliability
2. **Disable Cloudflare proxy** for GitHub Pages
3. **Keep CNAME in static/** to persist across deploys
4. **Wait for HTTPS** before sharing URLs publicly
5. **Test locally** with custom baseUrl before deploying
