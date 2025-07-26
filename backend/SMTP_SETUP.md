# Brevo Email Setup Guide

## 1. Get Your Brevo API Key

1. Go to [Brevo](https://www.brevo.com/) and create an account
2. Navigate to **SMTP & API** in your dashboard
3. Copy your **API Key** (not SMTP key)

## 2. Create Environment File

Create a `.env` file in the `backend` directory with the following content:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/time_tracker"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Brevo REST API Configuration
BREVO_SMTP_API_KEY="your-brevo-api-key"
SMTP_SENDER_NAME="Time Tracker"
SMTP_SENDER_EMAIL="noreply@timetracker.com"

# Server
PORT=3000
```

## 3. Replace Placeholder Values

- Replace `your-brevo-api-key` with your actual Brevo API key
- Update the `DATABASE_URL` if your database configuration is different
- Change the `JWT_SECRET` to a secure random string
- Customize `SMTP_SENDER_NAME` and `SMTP_SENDER_EMAIL` as needed

## 4. Test the Configuration

Start your backend server:

```bash
cd backend
npm start
```

You should see one of these messages in the console:

✅ **Success**: `Brevo API connection successful`
❌ **Error**: `Brevo API connection failed: [error details]`

## 5. How It Works

The system now uses Brevo's REST API instead of SMTP:

- **More reliable**: No SMTP connection issues
- **Better error handling**: Detailed API responses
- **Easier setup**: Just need an API key
- **Better monitoring**: Account information and delivery status

## 6. API Endpoint

The system sends emails using:
```
POST https://api.brevo.com/v3/smtp/email
```

With headers:
- `accept: application/json`
- `api-key: YOUR_API_KEY`
- `content-type: application/json`

## 7. Email Templates

The system sends professional HTML emails with:
- Company branding
- Clickable activation button
- Fallback text content
- Responsive design

## 8. Monitoring

Check the console logs for email sending status:
- `📧 Attempting to send email to: [email]`
- `✅ Email sent successfully: [messageId]`
- `❌ Email sending failed: [error]`

## 9. Troubleshooting

### Common Issues:

1. **"BREVO_SMTP_API_KEY environment variable is not set"**
   - Check that your `.env` file exists in the backend directory
   - Verify the API key is correctly set

2. **"Authentication failed"**
   - Check that your Brevo API key is correct
   - Ensure you're using the API key, not the SMTP key

3. **"Invalid sender email"**
   - Update `SMTP_SENDER_EMAIL` to a verified domain in Brevo
   - Or use a default Brevo sender address

### Brevo API Settings:
- **API URL**: `https://api.brevo.com/v3/smtp/email`
- **Authentication**: API Key in header
- **Content Type**: JSON
- **Method**: POST 