---
description: Deploy the frontend to GitHub Pages
---

// turbo-all

1. Regenerate the mock data (if needed):
```
node scripts/generate_data.js
```

2. Stage and commit any uncommitted local changes to `main`:
```
git add -A
git commit -m "Pre-deploy: save local changes"
git push origin main
```

3. Run the deploy script to push `frontend/` to `gh-pages`:
```
powershell -ExecutionPolicy Bypass -File scripts/deploy-gh-pages.ps1
```

4. Verify the deploy succeeded by checking the remote `gh-pages` branch contains the latest `app.js`:
```
git fetch origin
git show origin/gh-pages:app.js | Select-String "eightAM|social-posts-header" | Select-Object -First 5
```

The live site will update within ~60 seconds at https://robertcowling.github.io/impacts/
