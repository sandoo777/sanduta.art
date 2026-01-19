#!/bin/bash
cd /workspaces/sanduta.art
git add -A
git commit -m "fix: Add header to /products page, improve auth redirect, add debug tools

- Created layout for /products with Header and Footer
- Improved /account redirect to login without intermediate page  
- Fixed ConditionalHeader to exclude more public routes
- Updated Prisma client configuration for better logging
- Added debug API endpoints for database and auth testing
- Created admin user creation utilities (scripts and UI)
- Fixed NotificationsDropdown to check session before fetching"
git push origin main
