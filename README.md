# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deploying to Vercel

Deploying this application to Vercel is a straightforward process. Follow these steps to get your site live.

### Step 1: Push Your Code to a Git Repository

Vercel deploys directly from a Git repository (like GitHub, GitLab, or Bitbucket).

1.  Create a new repository on your preferred Git provider.
2.  Follow the provider's instructions to push your local project code to the new repository.

### Step 2: Import Your Project in Vercel

1.  [Sign up for a Vercel account](https://vercel.com/signup) if you don't have one.
2.  From your Vercel dashboard, click "**Add New...**" and select "**Project**".
3.  Connect Vercel to your Git provider and select the repository you just created.
4.  Vercel will automatically detect that this is a Next.js project and configure the build settings for you. You typically don't need to change anything here.

### Step 3: Configure Environment Variables

Your application uses Genkit for AI features, which requires an API key to communicate with Google's services. You must provide this key to Vercel.

1.  In the project configuration screen on Vercel, expand the "**Environment Variables**" section.
2.  Add a new environment variable:
    *   **Name**: `GOOGLE_API_KEY`
    *   **Value**: Paste your Google AI API key here. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  Ensure the key is available in all environments (Production, Preview, and Development).

### Step 4: Deploy

1.  Click the "**Deploy**" button.
2.  Vercel will start building and deploying your application. You can watch the progress in the build logs.
3.  Once complete, Vercel will provide you with a live URL for your project. Congratulations!
