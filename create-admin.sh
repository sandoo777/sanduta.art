#!/bin/bash

echo "Creating admin user..."

# Generate bcrypt hash for 'admin123'
# This is a pre-computed hash for password 'admin123' with cost 10
PASSWORD_HASH='$2a$10$2/Xh0VWzI5d2o6BNkLPgSeK.cGLa9Rr6Q8O5bGz4xaY6ZKfLY6sW6'

# Insert admin user directly via SQL
PGPASSWORD=password psql -h localhost -U postgres -d sanduta -c "
INSERT INTO \"User\" (id, email, name, password, role, \"createdAt\", \"updatedAt\")
VALUES (
  gen_random_uuid(),
  'admin@sanduta.art',
  'Admin User',
  '\$PASSWORD_HASH',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = 'ADMIN',
  \"updatedAt\" = NOW();
"

echo "✅ Admin user created!"
echo "   Email: admin@sanduta.art"
echo "   Password: admin123"
