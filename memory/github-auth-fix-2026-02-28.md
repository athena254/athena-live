# GitHub Authentication Fix - 2026-02-28

## Issue Summary

**Status:** Token expired  
**Account:** DisMuriuki  
**Config file:** `/root/.config/gh/hosts.yml`

```
github.com
  X Failed to log in to github.com account DisMuriuki (/root/.config/gh/hosts.yml)
  - Active account: true
  - The token in /root/.config/gh/hosts.yml is invalid.
```

## Diagnosis

The GitHub CLI (`gh`) token has expired. This happens because:
- GitHub Personal Access Tokens (PATs) have an expiration date
- The token was created with a specific validity period
- Once expired, `gh` commands fail with authentication errors

## Authentication Refresh Process

### Step 1: Check Current Status
```bash
gh auth status
```

### Step 2: Re-authenticate (Interactive)
```bash
gh auth login -h github.com
```

This will prompt you to:
1. Choose GitHub.com
2. Select HTTPS (recommended)
3. Login with your browser or paste a token
4. Grant appropriate scopes (repo, read:user, etc.)

### Step 3: Verify Authentication
```bash
gh auth status
```

### Alternative: Use GitHub Device Flow (Headless)
```bash
gh auth login -h github.com --web=false
```

### Alternative: Paste Existing Token
If you have a new PAT ready:
```bash
echo "ghp_your_new_token_here" | gh auth login -h github.com --with-token
```

## Credential Management Notes

- **Config location:** `/root/.config/gh/hosts.yml`
- **Token storage:** GitHub PATs must be regenerated at https://github.com/settings/tokens
- **Recommended scopes:** `repo`, `read:user`, `workflow`, `read:org`
- **Token lifetime:** Consider setting tokens to expire in 30-60 days for security

## Prevention

1. Set calendar reminders for token expiration
2. Use GitHub Apps or OAuth apps instead of PATs for long-lived integrations
3. Store PATs in a password manager with expiration alerts
