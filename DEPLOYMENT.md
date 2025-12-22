# 🚀 Deployment Guide

## Vercel Deployment (Recommended)

This application is optimized for Vercel's serverless platform.

### 1. Prepare Repository

The repository is already configured with:
- ✅ `vercel.json` configuration
- ✅ Serverless API functions in `/api` directory
- ✅ Static files in `/public` directory
- ✅ Environment variables template

### 2. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)

1. **Fork this repository** to your GitHub account
2. **Go to [vercel.com](https://vercel.com)** and sign in
3. **Click "New Project"**
4. **Import your forked repository**
5. **Configure environment variables** (see below)
6. **Deploy** - Vercel will automatically build and deploy

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your local repository
vercel

# Follow the prompts to configure your project
```

### 3. Environment Variables

Set these in your Vercel project dashboard:

```env
AI_PROVIDER=groq
AI_API_KEY=your_groq_api_key_here
AI_MODEL=llama-3.1-8b-instant
ENABLE_AI=true
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### Getting API Keys:

- **Groq API Key**: [console.groq.com/keys](https://console.groq.com/keys) (Free)
- **Google Maps API Key**: [Google Cloud Console](https://console.cloud.google.com/) (Free tier available)

### 4. Verify Deployment

After deployment, your app will be available at:
`https://your-project-name.vercel.app`

Test the endpoints:
- Main app: `https://your-project-name.vercel.app`
- Chat API: `https://your-project-name.vercel.app/api/query`
- Maps API: `https://your-project-name.vercel.app/api/nearby-attractions`

## Alternative Deployment Options

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `public`
4. Add environment variables in Netlify dashboard

### Railway

1. Connect your GitHub repository to Railway
2. Railway will auto-detect the Node.js app
3. Add environment variables in Railway dashboard
4. Deploy

### Heroku

1. Create a new Heroku app
2. Connect your GitHub repository
3. Add environment variables in Heroku dashboard
4. Enable automatic deploys

## Build Configuration

The project includes these build configurations:

- **TypeScript compilation**: `tsc` compiles all TypeScript files
- **Serverless functions**: API routes in `/api` directory
- **Static assets**: Frontend files in `/public` directory
- **Environment handling**: Automatic environment variable injection

## Troubleshooting

### Build Errors

If you get "Command 'npm run build' exited with 126":

1. **Check Node.js version**: Ensure you're using Node.js 18+ 
2. **Clear cache**: Delete `node_modules` and `package-lock.json`, then `npm install`
3. **Check TypeScript**: Run `npm run type-check` to verify no type errors

### API Key Issues

If APIs aren't working:

1. **Verify environment variables** are set correctly in your deployment platform
2. **Check API key validity** - test keys locally first
3. **Review logs** in your deployment platform's dashboard

### CORS Issues

If you get CORS errors:

1. **Check API endpoints** - they should include CORS headers
2. **Verify domain** - make sure your frontend domain matches API expectations

## Performance Optimization

The deployment is optimized for:

- ⚡ **Fast cold starts** with minimal dependencies
- 🔄 **Efficient caching** of static assets
- 📦 **Small bundle size** with tree-shaking
- 🌐 **Global CDN** distribution via Vercel Edge Network

## Security

- 🔒 **API keys** are properly secured as environment variables
- 🛡️ **CORS** headers configured for secure API access
- 🚫 **No sensitive data** in client-side code
- ✅ **Input validation** on all API endpoints

---

**Ready to deploy? Choose Vercel for the best experience! 🚀**