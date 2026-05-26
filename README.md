
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

### 3. Deployment Setup (Vercel/Firebase)
When you deploy, you MUST add these 2 environment variables in their dashboard so the Word-to-PDF tool works:
- `CONVERT_API_SECRET`
- `CLOUD_CONVERT_API_KEY`

### 4. Vercel "Deployment Blocked" Fix
If Vercel blocks your deployment after making the repo private:
1. Go to **Vercel Dashboard** -> Your Project -> **Settings** -> **Git**.
2. Click **Disconnect** repository.
3. Click **Connect** again and select your private repository.
4. Ensure the Vercel GitHub App has permissions (Check GitHub Settings -> Applications -> Vercel).

---

## Features
- **AI Image Processing**: Compression, Resizing, BG Removal, Enhancement.
- **PDF Suite**: Secure Locking, Unlocking, Merging, Splitting, Conversion.
- **Tools Hub**: 40+ utilities for daily productivity.

## Deployment
1. Connect your (Private) GitHub repo.
2. Add Environment Variables in Settings.
3. Deploy!
