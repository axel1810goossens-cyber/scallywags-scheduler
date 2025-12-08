# Code Quality Setup

This project uses Husky, ESLint, and Prettier to maintain code quality and consistency.

## What's Configured

### 🪝 Husky Pre-commit Hooks

- Automatically runs before every commit
- Uses `lint-staged` to check only staged files
- Fixes issues automatically when possible

### ✨ Prettier (Code Formatting)

- Formats JavaScript, JSX, JSON, CSS, SCSS files
- Runs automatically on commit
- Configuration in `.prettierrc`

### 🔍 ESLint (Code Linting)

- Checks for code quality and React best practices
- Configuration in `eslint.config.js`
- Runs automatically on commit

## Available Scripts

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

## How It Works

### Pre-commit Hook

When you run `git commit`, Husky automatically:

1. **Runs ESLint** on staged `.js` and `.jsx` files
2. **Runs Prettier** on staged `.js`, `.jsx`, `.json`, `.css`, `.scss`, `.md` files
3. **Fixes issues automatically** when possible
4. **Stops the commit** if there are errors that can't be auto-fixed

### What Gets Checked

Configured in `package.json` under `lint-staged`:

```json
{
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,scss,md}": ["prettier --write"]
}
```

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

## Skipping Pre-commit Checks

**Not recommended**, but if you need to skip checks:

```bash
git commit --no-verify -m "your message"
```

## Fixing Issues

### If commit fails due to linting errors:

1. **View the errors** - Husky will show what failed
2. **Fix automatically** (if possible):
   ```bash
   npm run lint:fix
   npm run format
   ```
3. **Fix manually** - Address remaining issues
4. **Stage changes**:
   ```bash
   git add .
   ```
5. **Commit again**:
   ```bash
   git commit -m "your message"
   ```

### Common issues:

**Unused variables:**

- Remove them or prefix with `_` (e.g., `_unusedVar`)

**Missing prop types:**

- Add PropTypes validation or use TypeScript

**Formatting issues:**

- Run `npm run format` to auto-fix

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

- Linting runs on every PR and push
- Build fails if there are linting errors
- Ensures code quality before deployment

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

### "Prettier formatting conflicts"

```bash
# Format everything
npm run format

# Stage changes
git add .

# Commit again
git commit -m "your message"
```

### Disable for specific files

Add to `.eslintignore`:

```
dist/
build/
*.config.js
```

Add to `.prettierignore`:

```
dist/
build/
coverage/
```

## Best Practices

1. **Commit often** - Small commits are easier to fix
2. **Run checks manually** before committing large changes:
   ```bash
   npm run lint
   npm run format:check
   ```
3. **Install IDE extensions** for real-time feedback
4. **Don't skip hooks** - They catch issues early
5. **Fix warnings** - Don't let them accumulate

## Updating Rules

### Add new ESLint rules:

Edit `eslint.config.js` → `rules` section

### Change Prettier formatting:

Edit `.prettierrc`

### Add files to lint-staged:

Edit `package.json` → `lint-staged` section

After changes, test with:

```bash
npm run lint
npm run format:check
```
