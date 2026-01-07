import { v2 as cloudinary } from 'cloudinary';

async function testCloudinary() {
  console.log('🧪 Testing Cloudinary Configuration...\n');

  // Check environment variables
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('📋 Environment Variables:');
  console.log(`   CLOUDINARY_URL: ${cloudinaryUrl ? '✅ Set' : '❌ Not set'}`);
  console.log(`   CLOUDINARY_CLOUD_NAME: ${cloudName ? '✅ Set' : '❌ Not set'}`);
  console.log(`   CLOUDINARY_API_KEY: ${apiKey ? '✅ Set' : '❌ Not set'}`);
  console.log(`   CLOUDINARY_API_SECRET: ${apiSecret ? '✅ Set' : '❌ Not set'}\n`);

  // Check if using placeholder values
  if (cloudinaryUrl?.includes('api_key') || cloudinaryUrl?.includes('api_secret')) {
    console.log('❌ ERROR: Cloudinary URL contains placeholder values!');
    console.log('\n📝 Follow these steps to configure Cloudinary:\n');
    console.log('1. Sign up at: https://cloudinary.com/users/register/free');
    console.log('2. Get your credentials from Dashboard → Account Details');
    console.log('3. Update .env with your actual credentials:');
    console.log('   CLOUDINARY_URL="cloudinary://YOUR_API_KEY:YOUR_API_SECRET@YOUR_CLOUD_NAME"\n');
    console.log('4. Restart dev server: npm run dev\n');
    process.exit(1);
  }

  if (!cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
    console.log('❌ ERROR: Cloudinary not configured!');
    console.log('\n📝 Set one of the following in your .env file:\n');
    console.log('Option 1 (Recommended):');
    console.log('   CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"\n');
    console.log('Option 2:');
    console.log('   CLOUDINARY_CLOUD_NAME="your_cloud_name"');
    console.log('   CLOUDINARY_API_KEY="your_api_key"');
    console.log('   CLOUDINARY_API_SECRET="your_api_secret"\n');
    process.exit(1);
  }

  // Configure Cloudinary
  try {
    cloudinary.config();
    
    const config = cloudinary.config();
    console.log('✅ Cloudinary Configuration:');
    console.log(`   Cloud Name: ${config.cloud_name}`);
    console.log(`   API Key: ${config.api_key}\n`);

    // Test API connection with ping
    console.log('🔌 Testing API connection...');
    
    // Simple API test - get usage details
    const result = await cloudinary.api.ping();
    
    console.log('✅ API Connection: SUCCESS');
    console.log(`   Status: ${result.status}\n`);

    console.log('🎉 Cloudinary is properly configured and working!\n');
    console.log('📚 Next steps:');
    console.log('   1. Upload test: Visit /admin/products and try uploading an image');
    console.log('   2. Check Cloudinary Dashboard: https://cloudinary.com/console');
    console.log('   3. View uploaded images in "Media Library" section\n');

  } catch (error) {
    console.error('❌ API Connection FAILED:', error);
    
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}\n`);
      
      if (error.message.includes('401')) {
        console.log('💡 This usually means invalid API credentials.');
        console.log('   Double-check your CLOUDINARY_URL or API keys in .env\n');
      }
    }
    
    process.exit(1);
  }
}

testCloudinary();
