# Deploy To Vercel

This app is ready to be pushed to GitHub and deployed on Vercel.

Project folder:

`C:\Users\matt.madden\OneDrive - Vitalis Corp\Desktop\Base44\follow-through-code\follow-through`

## What is already set up

- Git repo initialized locally
- `vercel.json` added for React Router SPA rewrites
- `.env.example` added
- `.gitignore` updated so `.env.example` is included
- Local production build verified with `npm run build`

## Required environment variables

Create these in Vercel:

```env
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

You can use `.env.example` as the template.

## Push to GitHub

From this folder, run:

```powershell
git add .
git commit -m "Initial Base44 export"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## Create the Vercel project

1. Open Vercel
2. Click `Add New Project`
3. Import your GitHub repo
4. Use these settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

## Add the environment variables in Vercel

In the Vercel project settings, add:

- `VITE_BASE44_APP_ID`
- `VITE_BASE44_APP_BASE_URL`

Then deploy.

## Important note

This app uses React Router, so `vercel.json` is required to make routes like:

- `/`
- `/stats`
- `/checkin`
- `/edit/:taskId`

work correctly on refresh and direct open.

## Files to know

- `vercel.json`
- `.env.example`
- `README.md`
- `package.json`

## Quick checklist

- GitHub repo created
- Code pushed
- Vercel project imported
- Environment variables added
- First deploy completed
