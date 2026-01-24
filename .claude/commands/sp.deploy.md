---
description: Deploy Docusaurus multi-instance book to GitHub Pages with automated CI/CD setup
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

### Phase 1: Pre-Deployment Verification

1. **Check Prerequisites**
   - Verify Node.js 20+ is installed: `node --version`
   - Verify npm is installed: `npm --version`
   - Verify git repository exists: `git rev-parse --git-dir`
   - Check if GitHub remote exists: `git remote -v`

2. **Read Skill Documentation**
   - Load skill: `.claude/skills/github-pages-deploy/SKILL.md`
   - Load config reference: `.claude/skills/github-pages-deploy/references/docusaurus-config.md`

3. **Analyze Current Configuration**
   - Read `main-site/docusaurus.config.js`
   - Read `module1-ros2/docusaurus.config.js`
   - Read `module2-simulation/docusaurus.config.js`
   - Read `module3-isaac/docusaurus.config.js`
   - Read `module4-vla/docusaurus.config.js`
   - Extract: url, baseUrl, organizationName, projectName

### Phase 2: Configuration Setup

4. **Determine Deployment Target**
   - Ask user if using default GitHub Pages URL or custom domain
   - If custom domain: collect domain name

5. **Update Docusaurus Configurations**
   For each site, ensure correct settings:
   ```javascript
   url: 'https://<org>.github.io',  // or custom domain
   baseUrl: '/<repo>/' // or '/' for custom domain
   organizationName: '<org>',
   projectName: '<repo>',
   ```

   Module baseUrl values:
   - main-site: `/physical-ai-textbook/`
   - module1-ros2: `/physical-ai-textbook/module1/`
   - module2-simulation: `/physical-ai-textbook/module2/`
   - module3-isaac: `/physical-ai-textbook/module3/`
   - module4-vla: `/physical-ai-textbook/module4/`

### Phase 3: GitHub Actions Setup

6. **Create Workflow Directory**
   ```bash
   mkdir -p .github/workflows
   ```

7. **Copy Workflow Template**
   - Copy `.claude/skills/github-pages-deploy/templates/deploy-multi-instance.yml`
   - To: `.github/workflows/deploy.yml`

8. **Create Supporting Files**
   - Create `main-site/static/.nojekyll` (empty file)
   - If custom domain: Create `main-site/static/CNAME` with domain

### Phase 4: Build Verification

9. **Test Local Build**
   ```bash
   npm install
   npm run build --workspace=main-site
   npm run build --workspace=module1-ros2
   npm run build --workspace=module2-simulation
   npm run build --workspace=module3-isaac
   npm run build --workspace=module4-vla
   ```

10. **Verify Build Outputs**
    - Check `main-site/build/` exists
    - Check `module1-ros2/build/` exists
    - Check `module2-simulation/build/` exists
    - Check `module3-isaac/build/` exists
    - Check `module4-vla/build/` exists

### Phase 5: Deployment

11. **Show GitHub Configuration Steps**
    Display instructions for user to complete in GitHub:

    ```
    1. Go to repository Settings > Pages
    2. Source: Select "GitHub Actions"
    3. Go to Settings > Actions > General
    4. Workflow permissions: "Read and write permissions"
    5. Check "Allow GitHub Actions to create pull requests"
    ```

12. **Commit and Push**
    - If user confirms, create commit with deployment config
    - Push to trigger GitHub Actions

13. **Provide Deployment URLs**
    Display expected URLs:
    - Main: `https://<org>.github.io/<repo>/`
    - Module 1: `https://<org>.github.io/<repo>/module1/`
    - Module 2: `https://<org>.github.io/<repo>/module2/`
    - Module 3: `https://<org>.github.io/<repo>/module3/`
    - Module 4: `https://<org>.github.io/<repo>/module4/`

## User Arguments Handling

- `setup` - Run full setup (Phases 1-3)
- `verify` - Run verification only (Phase 1)
- `build` - Run local build test (Phase 4)
- `status` - Check current configuration
- `--domain <domain>` - Use custom domain
- `--dry-run` - Show what would be done without making changes

## Example Usage

```
/sp.deploy                    # Full setup with defaults
/sp.deploy setup              # Run setup workflow
/sp.deploy verify             # Verify configuration
/sp.deploy build              # Test local build
/sp.deploy --domain docs.example.com  # Setup with custom domain
```

## Troubleshooting

If deployment fails:
1. Check GitHub Actions logs
2. Verify baseUrl matches repo name
3. Ensure Pages is set to "GitHub Actions" source
4. Run `node .claude/skills/github-pages-deploy/scripts/verify-deployment.js`

See `.claude/skills/github-pages-deploy/references/troubleshooting.md` for detailed solutions.

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route is automatically determined by stage:
     - `constitution` → `history/prompts/constitution/`
     - Feature stages → `history/prompts/<feature-name>/` (spec, plan, tasks, red, green, refactor, explainer, misc)
     - `general` → `history/prompts/general/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Open the file and fill remaining placeholders (YAML + body), embedding full PROMPT_TEXT (verbatim) and concise RESPONSE_TEXT.
   - If the script fails:
     - Read `.specify/templates/phr-template.prompt.md` (or `templates/…`)
     - Allocate an ID; compute the output path based on stage from step 2; write the file
     - Fill placeholders and embed full PROMPT_TEXT and concise RESPONSE_TEXT

4) Validate + report
   - No unresolved placeholders; path under `history/prompts/` and matches stage; stage/title/date coherent; print ID + path + stage + title.
   - On failure: warn, don't block. Skip only for `/sp.phr`.
