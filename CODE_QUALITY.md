# Code Quality & Security Setup

This project uses Husky, ESLint, Prettier, and npm audit to maintain code quality, consistency, and security.

## What's Configured

### 🪝 Husky Pre-commit Hooks

- Automatically runs before every commit
- Checks for high/critical security vulnerabilities
- Uses `lint-staged` to check only staged files
- Fixes issues automatically when possible

### 🔒 Security Auditing

- Runs `npm audit` before every commit
- **Blocks commits** with high or critical vulnerabilities
- Weekly automated security checks via GitHub Actions
- Separate checks for frontend and backend dependencies

### ✨ Prettier (Code Formatting)

- Formats JavaScript, JSX, JSON, CSS, SCSS files
- Runs automatically on commit
- Configuration in `.prettierrc`

### 🔍 ESLint (Code Linting)

- Checks for code quality and React best practices
- Configuration in `eslint.config.js`
- Runs automatically on commit

## Available Scripts

### Security Auditing

```bash
# Check for all vulnerabilities
npm audit

# Check for high/critical only
npm audit --audit-level=high

# Fix vulnerabilities automatically (use with caution)
npm audit fix

# Check production dependencies only
npm audit --omit=dev
```

### Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix
```

### Formatting

```bash
# Check if files are formatted correctly
npm run format:check

# Format all files
npm run format
```

## How Pre-commit Works

When you run `git commit`, Husky automatically:

### 1. 🔍 Security Check

- Runs `npm audit --audit-level=high --omit=dev`
- Checks for high/critical vulnerabilities in production dependencies
- **Blocks commit** if vulnerabilities found
- Shows how to fix the issues

### 2. ✨ Code Quality Check

- Runs ESLint on staged `.js` and `.jsx` files
- Runs Prettier on staged files
- Fixes issues automatically when possible
- Stops commit if there are unfixable errors

### Example output:

```bash
🔍 Checking for high/critical security vulnerabilities...
✅ No high/critical vulnerabilities found

✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
[main abc1234] Your commit message
```

## Security Audit Levels

The pre-commit hook checks for:

- **High severity** - Serious vulnerabilities
- **Critical severity** - Immediate action required

Other severities (info, low, moderate) won't block commits but should be addressed:

```bash
npm audit
npm audit fix
```

## GitHub Actions - Weekly Security Scan

`.github/workflows/security-audit.yml` runs:

- **On push/PR** - Checks security on every change
- **Weekly** - Scheduled Monday 9 AM UTC
- **Manual** - Can trigger from Actions tab

It checks:

- Frontend dependencies (`npm audit`)
- Backend dependencies (`backend/npm audit`)
- Posts summary in workflow results

## Handling Vulnerabilities

### If commit is blocked:

```bash
❌ COMMIT BLOCKED: High or critical vulnerabilities found!
Run 'npm audit' to see details and 'npm audit fix' to fix them.
```

**Steps to fix:**

1. **See the details:**

   ```bash
   npm audit
   ```

2. **Try automatic fix:**

   ```bash
   npm audit fix
   ```

3. **If auto-fix doesn't work:**

   ```bash
   # See what can be fixed with breaking changes
   npm audit fix --force

   # Or update specific packages
   npm update package-name
   ```

4. **Test your app** after fixing

5. **Commit again:**
   ```bash
   git add package.json package-lock.json
   git commit -m "fix: Update vulnerable dependencies"
   ```

### If you need to commit urgently:

**Not recommended**, but you can skip the check:

```bash
git commit --no-verify -m "your message"
```

⚠️ **Remember to fix vulnerabilities ASAP!**

## ESLint Rules

Key rules (see `eslint.config.js` for full config):

- ✅ React hooks rules enforced
- ✅ No unused variables (warning)
- ✅ Prop types validation (warning)
- ✅ React Refresh best practices
- ✅ No need to import React in JSX files

## Prettier Rules

Configuration in `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

## What Gets Checked

Configured in `package.json` under `lint-staged`:

```json
{
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,scss,md}": ["prettier --write"]
}
```

## IDE Integration

### VS Code

Install these extensions for real-time feedback:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### WebStorm / IntelliJ

- ESLint and Prettier are auto-detected
- Enable "Run eslint --fix on save" in preferences

## CI/CD Integration

The GitHub Actions workflows also run these checks:

- **Security audit** runs on every push/PR
- **Linting** runs on every PR and push
- **Weekly automated security scans**
- Build fails if there are critical vulnerabilities or linting errors

## Troubleshooting

### "Husky command not found"

```bash
npm install
npm run prepare
```

### "ESLint errors prevent commit"

```bash
# See what's wrong
npm run lint

# Try to auto-fix
npm run lint:fix

# Check again
npm run lint
```

### "High severity vulnerabilities found"

```bash
# See details
npm audit

# Try to fix
npm audit fix

# If that doesn't work, update packages
npm update

# Check again
npm audit --audit-level=high
```

### "Cannot find module during audit"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Best Practices

1. **Run audits regularly** - Don't wait for pre-commit hook

   ```bash
   npm audit
   ```

2. **Keep dependencies updated:**

   ```bash
   npm outdated
   npm update
   ```

3. **Check GitHub's Dependabot alerts** - Automatically created PRs

4. **Commit often** - Small commits are easier to fix

5. **Don't skip security checks** - They protect your users

6. **Test after updates** - Security fixes can introduce breaking changes

7. **Monitor weekly security reports** in GitHub Actions

## Monitoring Security

### In GitHub:

1. Go to **Security** tab
2. Check **Dependabot alerts**
3. Review **Actions** tab for weekly audit results

### Locally:

```bash
# Quick security check
npm audit --audit-level=high --omit=dev

# Full report
npm audit

# Backend check
cd backend && npm audit
```

## Updating Configuration

### Change audit sensitivity:

Edit `.husky/pre-commit` - change `--audit-level=high` to:

- `critical` - Only block critical vulnerabilities
- `moderate` - Block moderate and above
- `low` - Block everything (very strict)

### Ignore specific vulnerabilities:

Create `.npmrc` file:

```
audit-level=high
```

### Add more checks:

Edit `.husky/pre-commit` to add custom validation

## Resources

- [npm audit docs](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [GitHub Security advisories](https://github.com/advisories)
- [ESLint rules](https://eslint.org/docs/rules/)
- [Prettier options](https://prettier.io/docs/en/options.html)
