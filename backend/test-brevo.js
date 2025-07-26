import dotenv from 'dotenv';
import { testBrevoConnection, sendMail } from './mailer.js';

dotenv.config();

async function testBrevo() {
  console.log('🧪 Testing Brevo API Configuration...\n');
  
  // Test connection
  const connectionSuccess = await testBrevoConnection();
  
  if (!connectionSuccess) {
    console.log('\n❌ Connection failed. Please check your API key and try again.');
    return;
  }
  
  console.log('\n✅ Connection successful! Testing email sending...\n');
  
  // Test email sending (replace with your email)
  const testEmail = process.env.TEST_EMAIL || 'your-email@example.com';
  
  try {
    await sendMail({
      to: testEmail,
      subject: 'Test Email from Time Tracker',
      text: 'This is a test email to verify Brevo API integration.',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify that Brevo API integration is working correctly.</p>
        <p>If you received this email, the configuration is successful! 🎉</p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Check your inbox at: ${testEmail}`);
  } catch (error) {
    console.log('❌ Test email failed:', error.message);
  }
}

testBrevo(); 