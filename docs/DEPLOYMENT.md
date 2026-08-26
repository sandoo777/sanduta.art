# Deployment Guide - Sanduta Art

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL database for production
- Vercel account (vercel.com)
- Custom domain (e.g., sanduta.art)
- API keys for Paynet, Nova Poshta, Cloudinary

## Step 1: Prepare Environment Variables

Update `.env.production` with actual production values:

```bash
DATABASE_URL="postgresql://user:password@host:5432/sanduta_prod"
NEXTAUTH_SECRET="your-secure-random-string-min-32-chars"
NEXTAUTH_URL="https://sanduta.art"
PAYNET_API_KEY="your-key"
PAYNET_SECRET="your-secret"
PAYNET_MERCHANT_ID="your-id"
NOVAPOSTA_API_KEY="your-key"
NEXT_PUBLIC_GA_ID="G-XXXXX"
```

## Step 2: Build Verification

Verify the production build locally:

```bash
npm run build
npm start
```

Visit `http://localhost:3000` and verify:
- Homepage loads correctly
- Products page displays and filters work
- Checkout form validates properly

## Step 3: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Connect your GitHub repository (sandoo777/sanduta.art)
4. Configure project settings:
   - Framework: Next.js (auto-detected)
   - Root Directory: ./
   - Environment: Node.js 20.x

## Step 4: Configure Environment Variables

In Vercel Dashboard:

1. Go to Settings → Environment Variables
2. Add the following variables:
   ```
   DATABASE_URL (Database connection string)
   NEXTAUTH_SECRET (32+ random characters)
   NEXTAUTH_URL (https://sanduta.art)
   PAYNET_API_KEY
   PAYNET_SECRET
   PAYNET_MERCHANT_ID
   PAYNET_API_URL
   NOVAPOSTA_API_KEY
   NOVAPOSTA_API_URL
   NEXT_PUBLIC_GA_ID (Google Analytics ID)
   CLOUDINARY_URL (Cloudinary connection string)
   EMAIL_SERVER
   EMAIL_FROM
   ```

3. Set environment scope to "Production"

## Step 5: Deploy to Vercel

1. Click "Deploy" button in Vercel
2. Wait for build to complete (usually 2-3 minutes)
3. Visit the provided Vercel URL to verify deployment

## Step 6: Configure Custom Domain

1. In Vercel Dashboard, go to Settings → Domains
2. Add domain: `sanduta.art`
3. Choose domain registrar and select DNS provider:
   - For Cloudflare: Add CNAME record pointing to Vercel
   - For other providers: Follow Vercel's instructions

### DNS Configuration Example (Cloudflare):

```
CNAME record:
Name: sanduta.art (or @)
Target: cname.vercel-dns.com
```

4. Verify domain resolves (can take up to 24 hours)

## Step 7: Test Production Site

After domain is configured, test:

### Homepage
- [ ] Page loads with correct title and description
- [ ] Hero banner displays properly
- [ ] Featured products section loads
- [ ] Categories grid visible

### Products Page
- [ ] Products load from database
- [ ] Search functionality works
- [ ] Category filters functional
- [ ] Price range slider responsive
- [ ] Sorting options work

### Checkout Flow
- [ ] Form validation shows appropriate errors
- [ ] Email validation works
- [ ] Phone validation works
- [ ] City search returns results
- [ ] Nova Poshta integration works
- [ ] Paynet payment button appears

### Analytics
- [ ] Check Google Analytics dashboard
- [ ] Verify page views tracked
- [ ] Check event tracking (cart adds, etc.)

## Step 8: Enable Automatic Deployments

In Vercel Dashboard:

1. Go to Settings → Git
2. Ensure "Deploy on every push to main" is enabled
3. Optionally enable "Preview Deployments" for branches

## Step 9: Monitor Production

### Vercel Analytics
1. Go to Analytics in Vercel Dashboard
2. Monitor:
   - Page response times
   - Web Core Vitals
   - Error rates
   - Request patterns

### Database Monitoring
- Monitor database connections
- Check for slow queries
- Monitor storage growth

### Error Tracking
- Check Vercel Logs for errors
- Monitor email notifications

## Rollback Procedure

If issues occur:

1. Go to Vercel Deployments
2. Find previous stable deployment
3. Click "Promote to Production"
4. Or rollback by pushing to main again

## Performance Tips

1. **Caching**: Product API responses cached for 1 hour
2. **Images**: Use Cloudinary for optimization
3. **Database**: Add indexes for product queries
4. **Monitoring**: Set up alerts for error rates

## Troubleshooting

### Database Connection Error
- Verify DATABASE_URL in environment variables
- Check database server is accessible from Vercel
- Ensure firewall allows Vercel IP ranges

### Payment Gateway Not Working
- Verify API keys are correct
- Check API URLs are correct
- Enable CORS if needed

### Delivery Integration Issues
- Verify Nova Poshta API key
- Check API rate limits
- Test with test endpoints first

## Support

For issues:
1. Check Vercel logs in dashboard
2. Verify environment variables
3. Test locally with production config
4. Check API provider status pages

## Maintenance

Weekly checks:
- [ ] Review error logs
- [ ] Monitor database performance
- [ ] Check payment gateway status
- [ ] Verify email delivery

Monthly checks:
- [ ] Review analytics data
- [ ] Check Core Web Vitals
- [ ] Update dependencies
- [ ] Security audits
