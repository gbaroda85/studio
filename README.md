
# GR7 Tools - Professional Studio

This is a high-performance utility suite built with Next.js and Firebase Studio.

## 🔐 Security Instructions (ACTION REQUIRED)

### 1. How to verify Repo is Private
Look at the very top-left of your GitHub page near the repository name:
`gbaroda85 / studio` 🔒 
- If you see a **Lock icon**, it is already **Private**. You are safe!

### 2. How to change Visibility (If needed)
1. Go to the **Settings** tab (the gear icon ⚙️ in the top row).
2. On the left sidebar, make sure **General** is selected.
3. **Scroll to the very bottom** of the page to find the section called **"Danger Zone"**.
4. Click the button **"Change visibility"** to toggle between Public and Private.

### 3. Git Authentication Fix (For "Failed to authenticate" Error)
If you see a "Failed to authenticate to git remote" error like in the screenshot:
1. **Refresh Studio**: Browser tab ko refresh karein.
2. **Re-connect GitHub**: Firebase Studio mein left sidebar mein 'Source Control' par jayein aur agar mangey toh 'Connect to GitHub' dubara karein.
3. **Personal Access Token**: Agar aap manual git use kar rahe hain, toh ensure karein ki aapka GitHub PAT (Token) valid hai aur 'workflow' scopes enabled hain.

### 4. Vercel "Deployment Blocked" Fix
If Vercel blocks your deployment after making the repo private, follow these steps to refresh permissions:

**Part A: GitHub App Permissions**
1. Click your **Profile Picture** (Top Right) on GitHub -> **Settings**.
2. Left sidebar -> **Applications** -> **Installed GitHub Apps**.
3. Find **Vercel** -> Click **Configure**.
4. Scroll to **Repository access** -> Select **"All repositories"** and click **Save**.

**Part B: Vercel Dashboard Reconnect**
1. Go to **Vercel Dashboard** -> Open your project.
2. Click the **Settings** tab (Top row) -> Click **Git** (Left sidebar).
3. Scroll down and click the **"Disconnect"** button.
4. Now click **"Connect"** again and select your **Private Studio Repository**.

### 5. Environment Variables
When you deploy, you MUST add these 2 environment variables in the Vercel/Firebase dashboard so the Word-to-PDF tool works:
- `CONVERT_API_SECRET`
- `CLOUD_CONVERT_API_KEY`

---

## Features
- **AI Image Processing**: Compression, Resizing, BG Removal, Enhancement.
- **PDF Suite**: Secure Locking, Unlocking, Merging, Splitting, Conversion.
- **Tools Hub**: 40+ utilities for daily productivity.

## Deployment
1. Connect your (Private) GitHub repo.
2. Add Environment Variables in Settings.
3. Deploy!

---
**Status**: Development Environment Synchronized
**Last Build Patch**: Git Auth Troubleshooting Added
