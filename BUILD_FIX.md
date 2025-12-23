# Fix for Vercel Build Error (Exit Code 126)

## Problem
Command "npm run vercel-build" exited with 126

## Root Cause
Exit code 126 typically indicates a permission denied error or command not found. The issue was:
1. Redundant `vercel-build` script in package.json
2. Vercel trying to run a non-standard build command

## Solution Applied
1. **Removed redundant script**: Deleted `vercel-build` from package.json
2. **Simplified configuration**: Let Vercel use the standard `build` script
3. **Clean Vercel config**: Removed unnecessary buildCommand from vercel.json

## Current Configuration

### package.json scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "vercel dev", 
    "start": "npm run build && node dist/index.js"
  }
}
```

### vercel.json:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

## Verification
- ✅ `npm run build` works locally
- ✅ `npm run type-check` passes
- ✅ TypeScript compilation successful
- ✅ API functions compile correctly

## Deployment Steps
1. **Push the updated code** to your repository
2. **Trigger a new deployment** in Vercel
3. **Vercel will now use** the standard `npm run build` command
4. **Build should complete** without exit code 126

## Alternative: Manual Deployment
If issues persist:
1. Run `npm run build` locally
2. Verify `dist/` directory is created
3. Use Vercel CLI: `vercel --prod`
4. Or deploy to Render instead (see DEPLOYMENT.md)

## Common Exit Code 126 Causes
- **Permission denied**: Script file not executable
- **Command not found**: Script references non-existent command
- **Path issues**: Command not in PATH
- **Node.js version**: Incompatible Node.js version

## Prevention
- Use standard npm script names (`build`, `start`, `dev`)
- Avoid custom build commands in vercel.json unless necessary
- Test builds locally before deploying
- Keep dependencies up to date