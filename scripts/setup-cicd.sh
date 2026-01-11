#!/bin/bash
# CI/CD Setup Script
# Quick setup pentru GitHub Secrets și prima configurare

set -e

echo "🚀 CI/CD Setup pentru sanduta.art"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) nu este instalat${NC}"
    echo "Install: https://cli.github.com/"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Nu ești autentificat cu GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI ready${NC}"
echo ""

# Function to set secret
set_secret() {
    local name=$1
    local description=$2
    local value=$3
    
    if [ -z "$value" ]; then
        echo -e "${YELLOW}📝 $description${NC}"
        read -p "Enter $name: " value
    fi
    
    if [ -n "$value" ]; then
        gh secret set "$name" --body "$value"
        echo -e "${GREEN}✅ $name configured${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped $name${NC}"
    fi
}

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32
}

echo "🔐 Configurare GitHub Secrets"
echo "=============================="
echo ""

# Database URLs
echo "1️⃣  Database Configuration"
set_secret "DATABASE_URL" "Production PostgreSQL URL" ""
set_secret "DATABASE_URL_STAGING" "Staging PostgreSQL URL" ""
set_secret "DATABASE_URL_TEST" "Test PostgreSQL URL" "postgresql://test:test@localhost:5432/test"
echo ""

# NextAuth
echo "2️⃣  NextAuth Configuration"
NEXTAUTH_SECRET=$(generate_secret)
set_secret "NEXTAUTH_SECRET" "Production NextAuth Secret" "$NEXTAUTH_SECRET"
NEXTAUTH_SECRET_STAGING=$(generate_secret)
set_secret "NEXTAUTH_SECRET_STAGING" "Staging NextAuth Secret" "$NEXTAUTH_SECRET_STAGING"
NEXTAUTH_SECRET_TEST=$(generate_secret)
set_secret "NEXTAUTH_SECRET_TEST" "Test NextAuth Secret" "$NEXTAUTH_SECRET_TEST"
echo ""

# Vercel
echo "3️⃣  Vercel Configuration"
echo "Get these from: https://vercel.com/account/tokens"
set_secret "VERCEL_TOKEN" "Vercel Deploy Token" ""
set_secret "VERCEL_ORG_ID" "Vercel Organization ID" ""
set_secret "VERCEL_PROJECT_ID" "Vercel Project ID" ""
echo ""

# External Services
echo "4️⃣  External Services"
set_secret "PAYNET_API_KEY" "Paynet API Key" ""
set_secret "PAYNET_SECRET" "Paynet Secret" ""
set_secret "NOVA_POSHTA_API_KEY" "Nova Poshta API Key" ""
set_secret "RESEND_API_KEY" "Resend API Key" ""
echo ""

# Cloudinary
echo "5️⃣  Cloudinary Configuration"
set_secret "CLOUDINARY_CLOUD_NAME" "Cloudinary Cloud Name" ""
set_secret "CLOUDINARY_API_KEY" "Cloudinary API Key" ""
set_secret "CLOUDINARY_API_SECRET" "Cloudinary API Secret" ""
echo ""

# Monitoring
echo "6️⃣  Monitoring & Alerts"
set_secret "SLACK_WEBHOOK" "Slack Webhook URL (optional)" ""
set_secret "LHCI_GITHUB_APP_TOKEN" "Lighthouse CI Token (optional)" ""
set_secret "SNYK_TOKEN" "Snyk Token (optional)" ""
echo ""

# Deployment
echo "7️⃣  Deployment Secrets"
STAGING_API_KEY=$(generate_secret)
set_secret "STAGING_API_KEY" "Staging API Key" "$STAGING_API_KEY"
PRODUCTION_API_KEY=$(generate_secret)
set_secret "PRODUCTION_API_KEY" "Production API Key" "$PRODUCTION_API_KEY"
REVALIDATE_SECRET=$(generate_secret)
set_secret "REVALIDATE_SECRET" "ISR Revalidation Secret" "$REVALIDATE_SECRET"
echo ""

echo ""
echo -e "${GREEN}✅ GitHub Secrets configured!${NC}"
echo ""

# List secrets
echo "📋 Configured Secrets:"
gh secret list
echo ""

# Next steps
echo "🎯 Next Steps:"
echo "1. Verify secrets: gh secret list"
echo "2. Test CI: git push origin main"
echo "3. Monitor: https://github.com/sandoo777/sanduta.art/actions"
echo "4. Deploy to staging: gh workflow run cd.yml -f environment=staging"
echo "5. Read docs: docs/CI_CD_COMPLETE.md"
echo ""

echo -e "${GREEN}🎉 Setup complete!${NC}"
