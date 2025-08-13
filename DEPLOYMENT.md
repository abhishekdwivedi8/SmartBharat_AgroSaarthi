# Deployment Guide - Kisan Sathi Digital Bharat

This guide covers deployment options for the Kisan Sathi Digital Bharat platform.

## 🚀 Quick Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the React app
   - Click "Deploy"

3. **Environment Variables** (Optional)
   - The app uses universal API keys, no setup needed
   - For custom keys, add in Vercel dashboard:
     - `GOOGLE_GEMINI_API_KEY`
     - `OPENWEATHER_API_KEY`

### Option 2: Netlify

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist/` folder to [netlify.com/drop](https://netlify.com/drop)
   - Or connect your GitHub repository

3. **Configure Redirects**
   Create `dist/_redirects`:
   ```
   /*    /index.html   200
   ```

### Option 3: Self-Hosted

1. **Build for Production**
   ```bash
   npm run build:pwa
   ```

2. **Serve with Any Static Server**
   ```bash
   # Using Python
   cd dist && python -m http.server 8000
   
   # Using Node.js serve
   npx serve dist
   
   # Using nginx (copy dist/ to web root)
   ```

## 🔧 Advanced Configuration

### PWA Configuration

The app is configured as a Progressive Web App with:
- Service Worker for offline functionality
- Web App Manifest for installation
- Offline page for network failures
- Background sync for data

### API Keys Configuration

**Universal Keys (Pre-configured):**
- Gemini AI: `AIzaSyCiS0R6n_ovjlvxok5ME2emg9ROJvFku1k`
- OpenWeather: `b8699df2df1e9e43934ff010d49c627d`

**Custom Keys Setup:**
```bash
# For Supabase functions, set environment variables:
GOOGLE_GEMINI_API_KEY=your_gemini_key
OPENWEATHER_API_KEY=your_weather_key
```

### Supabase Setup

1. **Create Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Create new project
   - Note the URL and anon key

2. **Deploy Edge Functions**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login and link project
   supabase login
   supabase link --project-ref your-project-ref
   
   # Deploy functions
   supabase functions deploy
   ```

3. **Set Environment Variables**
   ```bash
   supabase secrets set GOOGLE_GEMINI_API_KEY=your_key
   supabase secrets set OPENWEATHER_API_KEY=your_key
   ```

## 🌐 Domain Configuration

### Custom Domain Setup

1. **Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as shown

2. **Netlify**
   - Go to Site Settings → Domain Management
   - Add custom domain
   - Update DNS records

### SSL Certificate

Both Vercel and Netlify provide automatic SSL certificates.

## 📱 Mobile App Deployment

### PWA Installation

Users can install the app on mobile devices:

1. **Android (Chrome)**
   - Visit the website
   - Tap "Add to Home Screen" prompt
   - Or use Chrome menu → "Install App"

2. **iOS (Safari)**
   - Visit the website
   - Tap Share button
   - Select "Add to Home Screen"

### App Store Distribution

For native app store distribution:

1. **Use Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   npx cap add android
   npx cap add ios
   npm run build
   npx cap sync
   ```

2. **Build Native Apps**
   ```bash
   # Android
   npx cap open android
   
   # iOS
   npx cap open ios
   ```

## 🔍 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Optimize images
# Use WebP format for better compression
# Implement lazy loading for images
```

### Caching Strategy

The app implements multiple caching layers:
- Service Worker caches static assets
- IndexedDB stores offline data
- Browser cache for API responses

### CDN Configuration

For better global performance:
- Use Vercel's global CDN (automatic)
- Or configure CloudFlare for custom domains

## 🔒 Security Configuration

### Headers Configuration

The app includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### API Security

- API keys are server-side only
- CORS is properly configured
- Rate limiting on Supabase functions

## 📊 Monitoring & Analytics

### Error Tracking

Add error tracking service:
```bash
# Sentry example
npm install @sentry/react
```

### Performance Monitoring

Monitor Core Web Vitals:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### Usage Analytics

Add analytics service:
```bash
# Google Analytics 4
npm install gtag
```

## 🚨 Troubleshooting

### Common Issues

1. **Service Worker Not Updating**
   ```javascript
   // Clear cache and reload
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.getRegistrations().then(registrations => {
       registrations.forEach(registration => registration.unregister());
     });
   }
   ```

2. **API Keys Not Working**
   - Check Supabase function logs
   - Verify environment variables
   - Test API endpoints directly

3. **PWA Not Installing**
   - Check manifest.json validity
   - Ensure HTTPS is enabled
   - Verify service worker registration

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

## 📈 Scaling Considerations

### Database Scaling

- Monitor Supabase usage
- Implement connection pooling
- Consider read replicas for high traffic

### Function Scaling

- Supabase Edge Functions auto-scale
- Monitor execution time and memory usage
- Implement caching for expensive operations

### CDN Scaling

- Use global CDN for static assets
- Implement image optimization
- Consider edge computing for dynamic content

---

## 🎯 Production Checklist

- [ ] Build passes without errors
- [ ] All API keys configured
- [ ] PWA manifest valid
- [ ] Service worker registered
- [ ] Offline functionality tested
- [ ] Mobile responsiveness verified
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Analytics implemented
- [ ] Error tracking setup
- [ ] Domain configured
- [ ] SSL certificate active

**Ready to deploy! 🚀**