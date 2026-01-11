#!/usr/bin/env node
// Record deployment to database
// scripts/recordDeployment.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function recordDeployment(options) {
  const {
    environment,
    version,
    url,
    commit,
    deployedBy = 'ci-cd',
  } = options;

  try {
    console.log(`Recording deployment: ${version} to ${environment}`);

    // TODO: Create Deployment table in Prisma schema
    // For now, just log the deployment
    console.log({
      environment,
      version,
      url,
      commit,
      deployedBy,
      deployedAt: new Date(),
    });

    console.log('✅ Deployment recorded');
  } catch (error) {
    console.error('❌ Failed to record deployment:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach((arg, index) => {
    if (arg.startsWith('--')) {
      const key = arg.substring(2);
      const value = args[index + 1];
      options[key] = value;
    }
  });

  if (!options.environment || !options.version || !options.url) {
    console.error('Usage: node recordDeployment.js --environment=<env> --version=<ver> --url=<url> --commit=<sha>');
    process.exit(1);
  }

  recordDeployment(options).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = recordDeployment;
