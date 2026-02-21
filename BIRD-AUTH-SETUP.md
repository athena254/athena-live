# 🔐 Bird CLI Authentication Setup

**Goal:** Authenticate Bird CLI to access X/Twitter for free (required by last30days skill)

---

## 📋 What You Need

Bird CLI needs **2 cookies** from your logged-in Twitter/X session:
1. `auth_token` - Your session token
2. `ct0` - CSRF protection token

---

## 🦊 Method 1: Firefox (Easiest)

### Step 1: Open Twitter in Firefox
```
1. Open Firefox
2. Go to https://twitter.com (or x.com)
3. Log in to your account
4. Keep the tab open
```

### Step 2: Open Developer Tools
```
1. Press F12 (or right-click → Inspect)
2. Go to "Storage" tab (or "Application" in some browsers)
3. Expand "Cookies" on the left
4. Click on "https://twitter.com" (or "https://x.com")
```

### Step 3: Copy the Cookies
```
Find these two cookies in the list:

1. auth_token
   - Copy the entire "Value" field
   - Looks like: 1234567890abcdef... (long string)

2. ct0
   - Copy the entire "Value" field
   - Looks like: abcdef1234567890... (long string)
```

### Step 4: Test Authentication
```bash
# Replace YOUR_AUTH_TOKEN and YOUR_CT0 with actual values
bird --auth-token "YOUR_AUTH_TOKEN" --ct0 "YOUR_CT0" tweet "Testing Bird CLI auth"
```

If successful, you'll see: ✅ Tweet posted!

---

## 🌐 Method 2: Chrome/Chromium

### Step 1: Open Twitter in Chrome
```
1. Open Chrome
2. Go to https://twitter.com (or x.com)
3. Log in to your account
4. Keep the tab open
```

### Step 2: Open Developer Tools
```
1. Press F12 (or right-click → Inspect)
2. Go to "Application" tab
3. Expand "Cookies" on the left
4. Click on "https://twitter.com" (or "https://x.com")
```

### Step 3: Copy the Cookies
```
Find and copy these two cookies:

1. auth_token → Copy "Value"
2. ct0 → Copy "Value"
```

### Step 4: Test Authentication
```bash
bird --auth-token "YOUR_AUTH_TOKEN" --ct0 "YOUR_CT0" tweet "Testing Bird CLI auth"
```

---

## 🐧 Method 3: Automatic Extraction from Browser Profile

If you want Bird to extract cookies automatically:

### For Chrome:
```bash
# List available Chrome profiles
bird --chrome-profile-list

# Use a specific profile (replace "Default" with your profile name)
bird --chrome-profile "Default" tweet "Testing auto-extraction"
```

### For Firefox:
```bash
# List available Firefox profiles
bird --firefox-profile-list

# Use a specific profile
bird --firefox-profile "default" tweet "Testing auto-extraction"
```

**Note:** Browser must be **closed** for automatic extraction to work (file locks).

---

## ✅ After Authentication Works

Once you've successfully tested with:
```bash
bird --auth-token "YOUR_TOKEN" --ct0 "YOUR_CT0" tweet "Test"
```

**Tell me the values** and I'll:
1. Save them to Bird CLI's config (so you don't need to pass them every time)
2. Test the last30days skill with Twitter/X search
3. Verify everything works end-to-end

**OR** if you prefer, I can set up environment variables:
```bash
export BIRD_AUTH_TOKEN="YOUR_TOKEN"
export BIRD_CT0="YOUR_CT0"
```

---

## 🔒 Security Notes

- **These tokens are sensitive** - they give access to your Twitter account
- **Never share them publicly** (GitHub, public chats, etc.)
- **I'll store them securely** in `~/.config/bird/config.json` (not in git)
- **You can revoke them** anytime by logging out of Twitter (invalidates tokens)

---

## 🧪 Test Commands

After setup, test with:

```bash
# Post a tweet
bird tweet "Hello from Bird CLI!"

# Read a tweet
bird read https://twitter.com/username/status/123456789

# Search Twitter (used by last30days)
bird search "AI agents" --max-results 5

# Get your timeline
bird home --max-results 5
```

---

## ❓ Troubleshooting

### "Invalid auth_token"
- Token expired → Log out and back into Twitter, then copy new cookies
- Wrong token → Double-check you copied the full value (no trailing spaces)

### "Missing ct0"
- ct0 is required for write operations (tweet, reply)
- Read operations may work without it

### "Rate limited"
- Twitter limits unauthenticated API calls
- Authentication should resolve this

### "Browser profile not found"
- Close your browser completely
- Try manual cookie copy method instead

---

## 📞 Next Steps

1. **Copy your cookies** using one of the methods above
2. **Test with the bird command** provided
3. **Send me the values** (via secure message if possible)
4. **I'll configure everything** and verify last30days works

Ready when you are! 🐦
