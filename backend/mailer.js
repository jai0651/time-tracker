import axios from 'axios';

// Brevo REST API Configuration
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Enhanced sendMail function using Brevo REST API
export const sendMail = async (mailOptions) => {
  try {
    console.log('📧 Attempting to send email to:', mailOptions.to);
    
    const API_KEY = process.env.BREVO_SMTP_API_KEY;
    
    if (!API_KEY) {
      throw new Error('BREVO_SMTP_API_KEY environment variable is not set');
    }

    const payload = {
      sender: {
        name: process.env.SMTP_SENDER_NAME || 'Time Tracker',
        email: process.env.SMTP_SENDER_EMAIL || 'noreply@timetracker.com'
      },
      to: [
        {
          email: mailOptions.to,
          name: mailOptions.to.split('@')[0] // Use email prefix as name
        }
      ],
      subject: mailOptions.subject,
      htmlContent: mailOptions.html || mailOptions.text,
      textContent: mailOptions.text
    };

    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'accept': 'application/json',
        'api-key': API_KEY,
        'content-type': 'application/json'
      }
    });

    console.log('✅ Email sent successfully:', response.data.messageId);
    return response.data;
  } catch (error) {
    console.error('❌ Email sending failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test the API connection
export const testBrevoConnection = async () => {
  try {
    const API_KEY = process.env.BREVO_SMTP_API_KEY;
    
    if (!API_KEY) {
      console.log('❌ BREVO_SMTP_API_KEY environment variable is not set');
      return false;
    }

    console.log('📧 Testing Brevo API connection...');
    console.log('🔑 API Key:', API_KEY ? 'Present' : 'Missing');
    
    // Test with a simple request
    const response = await axios.get('https://api.brevo.com/v3/account', {
      headers: {
        'accept': 'application/json',
        'api-key': API_KEY
      }
    });
    
    console.log('✅ Brevo API connection successful');
    console.log('📊 Account info:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Brevo API connection failed:', error.response?.data || error.message);
    return false;
  }
};

// Keep the default export for backward compatibility
export default { sendMail }; 