# Sanduta.art - E-Commerce Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?style=for-the-badge&logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

A modern, full-stack e-commerce platform built with Next.js 16, featuring integrated payments, delivery tracking, and email notifications.

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Documentation](#documentation)

</div>

---

## 🎯 PROJECT STATUS

**Last Updated:** January 4, 2026  
**Status:** ✅ FULLY OPERATIONAL - Ready for Development

### ✅ Completed & Tested
- **All Pages:** 19 pages including admin panel, checkout, orders
- **All APIs:** 24 endpoints with proper authentication
- **Authentication:** NextAuth with JWT, role-based access (USER, MANAGER, ADMIN)
- **Database:** PostgreSQL with Prisma ORM, fully migrated
- **UI Components:** Stable Button, Input, Card, Select, Badge components
- **Admin Panel:** Complete CRUD for products, categories, users, orders
- **Middleware:** Route protection for admin/manager access
- **Tests:** 12/12 automated tests passing

### 🚀 Quick Start (Development)
```bash
npm run dev  # Server on http://localhost:3001
```

**Admin Access:**
- URL: http://localhost:3001/login
- Email: `admin@sanduta.art`
- Password: `admin123`

📊 **Full Test Report:** [RAPORT_TESTARE.md](RAPORT_TESTARE.md)

---

## 📸 Screenshots

> **Note**: Add screenshots of your application here once deployed

```
/screenshots
  ├── homepage.png
  ├── products.png
  ├── checkout.png
  ├── admin-panel.png
  └── mobile-view.png
```

---

## ✨ Features

### 🛍️ Customer Features
- **Product Catalog**: Browse products with advanced filtering by category, price, and search
- **Shopping Cart**: Real-time cart management with persistent storage
- **Checkout Flow**: Multi-step checkout with form validation
- **User Accounts**: Registration, login, and order history
- **Email Notifications**: Order confirmation and tracking emails via Resend
- **Mobile Responsive**: Fully optimized mobile experience with hamburger menu and touch-friendly UI

### 💳 Payment Integration
- **Paynet Gateway**: Secure card payments (VISA/MasterCard)
- **Cash on Delivery**: COD option with fallback handling
- **Payment Verification**: HMAC SHA256 webhook signature verification
- **Graceful Degradation**: Automatic fallback to COD if payment service unavailable

### 🚚 Delivery Integration
- **Nova Poshta API**: Integrated Ukrainian delivery service
- **City Search**: Real-time city autocomplete
- **Pickup Points**: Dynamic warehouse/pickup point selection
- **Home Delivery**: Address-based delivery option
- **Tracking**: Order tracking with shipment status updates
- **Fallback Handling**: Manual processing if API unavailable

### 👨‍💼 Admin Panel
- **Order Management**: View, update, and manage all orders
- **Product Management**: CRUD operations for products with image upload
- **User Management**: View and manage user accounts
- **Status Updates**: Update order, payment, and delivery statuses
- **Responsive Tables**: Mobile-friendly admin interface with horizontal scrolling

### 🎨 UI Components
- **Standardized Components**: Button, Input, Select, Card, Badge, SectionTitle
- **Status Badges**: Auto-colored badges for order statuses
- **Loading States**: Spinners and skeleton screens
- **Error States**: User-friendly error messages with retry options
- **Image Fallbacks**: Placeholder images for missing product photos

### 🔐 Security & Authentication
- **NextAuth.js**: Secure authentication with session management
- **Password Hashing**: bcrypt password encryption
- **Protected Routes**: Server-side authentication checks
- **Role-Based Access**: User and admin roles

### 📧 Email System
- **Order Confirmations**: Customer email with order details and delivery timeline
- **Admin Notifications**: Alert emails for new orders with action items
- **React Email Templates**: Professional HTML email templates
- **Async Sending**: Non-blocking email delivery

### 🧪 Testing & Quality
- **48 Unit Tests**: Comprehensive test coverage with Vitest
- **CI/CD Pipeline**: GitHub Actions for automated testing and builds
- **Structured Logging**: Tagged logs with timestamps for debugging
- **Error Handling**: Try/catch blocks on all API routes
- **Type Safety**: Full TypeScript coverage

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router, Turbopack)
- **React**: 19.2.3
- **Styling**: TailwindCSS 4 with custom components
- **State Management**: React Context API for cart
- **Authentication**: NextAuth.js 4.24.13

### Backend
- **API Routes**: Next.js API Routes (serverless)
- **Database**: PostgreSQL with Prisma ORM 7.2.0
- **Authentication**: NextAuth with Prisma adapter
- **Email**: Resend with @react-email/components
- **Image Upload**: Cloudinary integration

### Integrations
- **Payments**: Paynet (VISA/MasterCard)
- **Delivery**: Nova Poshta (Ukrainian postal service)
- **Email Service**: Resend
- **Image CDN**: Cloudinary

### Testing & Quality
- **Testing Framework**: Vitest 4.0.16
- **Testing Library**: @testing-library/react
- **Test Environment**: happy-dom
- **CI/CD**: GitHub Actions
- **Linting**: ESLint with Next.js config

### Development Tools
- **Language**: TypeScript 5
- **Package Manager**: npm
- **Version Control**: Git
- **Compiler**: Babel with React Compiler

---

## 📋 Prerequisites

- **Node.js**: 20.x or higher
- **PostgreSQL**: 14.x or higher
- **npm**: 9.x or higher

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sandoo777/sanduta.art.git
cd sanduta.art
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` and `.env.production` files in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sanduta_dev"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"

# Email (Optional for development)
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
EMAIL_FROM="noreply@sanduta.art"

# Cloudinary (for image uploads)
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Paynet Payment Gateway
PAYNET_API_KEY="your-paynet-api-key"
PAYNET_SECRET="your-paynet-secret-key"
PAYNET_MERCHANT_ID="your-paynet-merchant-id"
PAYNET_API_URL="https://api.paynet.example.com"

# Nova Poshta Delivery
NOVAPOSTA_API_KEY="your-novaposta-api-key"
NOVAPOSTA_API_URL="https://api.novaposhta.ua/v2.0/json"

# Resend (Email Service)
RESEND_API_KEY="re_your_resend_api_key"
ADMIN_EMAIL="admin@sanduta.art"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_GA_ID="G-YOUR-GOOGLE-ANALYTICS-ID"
```

See [Environment Variables](#environment-variables) for detailed descriptions.

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run prisma:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run Tests

```bash
# Run all tests
npm test -- --run

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## 🔐 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_SECRET` | Secret for NextAuth session encryption (min 32 chars) | `your-random-secret-here` |
| `NEXTAUTH_URL` | Base URL of your application | `http://localhost:3000` |

### Payment Integration

| Variable | Description |
|----------|-------------|
| `PAYNET_API_KEY` | API key for Paynet payment gateway |
| `PAYNET_SECRET` | Secret key for signature verification |
| `PAYNET_MERCHANT_ID` | Your merchant ID in Paynet |
| `PAYNET_API_URL` | Paynet API endpoint URL |

### Delivery Integration

| Variable | Description |
|----------|-------------|
| `NOVAPOSTA_API_KEY` | Nova Poshta API key |
| `NOVAPOSTA_API_URL` | Nova Poshta API endpoint (default: https://api.novaposhta.ua/v2.0/json) |

### Email Service

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key for sending emails |
| `ADMIN_EMAIL` | Email address for admin notifications |
| `EMAIL_SERVER` | SMTP server URL (optional) |
| `EMAIL_FROM` | From address for emails |

### Optional

| Variable | Description |
|----------|-------------|
| `CLOUDINARY_URL` | Cloudinary URL for image uploads |
| `NEXT_PUBLIC_GA_ID` | Google Analytics tracking ID |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable/disable analytics (true/false) |

---

## 📦 Project Structure

```
sanduta.art/
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI/CD pipeline
├── docs/
│   ├── EMAIL_SETUP.md            # Email configuration guide
│   ├── RELIABILITY.md            # Error handling documentation
│   ├── TESTING.md                # Testing guide
│   └── UI_COMPONENTS.md          # Component library docs
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Database seeding
├── public/
│   └── robots.txt                # SEO configuration
├── src/
│   ├── __tests__/                # Test files
│   │   ├── validation.test.ts
│   │   ├── paynet.test.ts
│   │   └── novaposhta.test.ts
│   ├── app/                      # Next.js app router
│   │   ├── api/                  # API routes
│   │   ├── admin/                # Admin panel
│   │   ├── checkout/             # Checkout flow
│   │   ├── products/             # Product pages
│   │   └── ...
│   ├── components/               # React components
│   │   ├── ui/                   # UI component library
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── context/
│   │   └── CartContext.tsx       # Shopping cart state
│   ├── emails/                   # Email templates
│   │   ├── order-confirmation.tsx
│   │   └── admin-new-order.tsx
│   ├── lib/                      # Utilities
│   │   ├── prisma.ts             # Prisma client
│   │   ├── validation.ts         # Form validation
│   │   ├── paynet.ts             # Payment client
│   │   ├── novaposhta.ts         # Delivery client
│   │   ├── email.ts              # Email service
│   │   └── logger.ts             # Structured logging
│   └── types/
│       └── next-auth.d.ts        # TypeScript definitions
├── vitest.config.ts              # Test configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## 🧪 Testing

### Run Tests

```bash
# Watch mode
npm test

# Run once (CI mode)
npm test -- --run

# With UI
npm run test:ui

# Coverage report
npm run test:coverage
```

### Test Coverage

- ✅ **48 tests** across 3 test suites
- ✅ Validation functions (19 tests)
- ✅ Paynet signature verification (12 tests)
- ✅ Nova Poshta integration (17 tests)

See [docs/TESTING.md](docs/TESTING.md) for detailed testing documentation.

---

## 📚 Documentation

- **[Email Setup Guide](docs/EMAIL_SETUP.md)**: Configure Resend and email templates
- **[Reliability Guide](docs/RELIABILITY.md)**: Error handling and logging
- **[Testing Guide](docs/TESTING.md)**: Test suite and CI/CD
- **[UI Components](docs/UI_COMPONENTS.md)**: Component library reference

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Docker

```bash
# Build image
docker build -t sanduta-art .

# Run container
docker run -p 3000:3000 --env-file .env.production sanduta-art
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Database Migration

```bash
# On production database
npx prisma migrate deploy
```

---

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests in watch mode |
| `npm test -- --run` | Run tests once |
| `npm run test:ui` | Open Vitest UI |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow TypeScript best practices
- Use existing UI components
- Update documentation
- Run `npm test` before committing

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Andrei Sanduta

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

**Andrei Sanduta**
- GitHub: [@sandoo777](https://github.com/sandoo777)
- Website: [sanduta.art](https://sanduta.art)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Vercel](https://vercel.com/) - Deployment platform
- [Prisma](https://www.prisma.io/) - Database ORM
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [Resend](https://resend.com/) - Email API
- [Nova Poshta](https://novaposhta.ua/) - Delivery service
- [Vitest](https://vitest.dev/) - Testing framework

---

## 📊 Project Status

![Build Status](https://img.shields.io/github/actions/workflow/status/sandoo777/sanduta.art/ci.yml?style=flat-square)
![Tests](https://img.shields.io/badge/tests-48%20passing-success?style=flat-square)
![Coverage](https://img.shields.io/badge/coverage-validation%2C%20payments%2C%20delivery-blue?style=flat-square)

**Current Version**: 0.1.0  
**Status**: Active Development  
**Last Updated**: January 3, 2026

---

<div align="center">

Made with ❤️ by [Andrei Sanduta](https://github.com/sandoo777)

⭐ Star this repository if you find it helpful!

</div>

