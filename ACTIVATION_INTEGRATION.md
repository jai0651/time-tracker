# Activation Flow Integration Guide

## 🎯 Overview

The activation flow is now fully integrated between frontend and backend, providing a seamless user experience for new employee account activation.

## 🔗 Complete Flow

### 1. Employee Creation (Admin)
```
Admin creates employee → Email sent with activation link
```

### 2. User Activation Process
```
User clicks link → Frontend auto-extracts token → Validates token → Sets password → Auto-login
```

## 🛠️ Backend Endpoints

### `POST /auth/validate-token`
**Purpose**: Validate activation token and return employee email

**Request**:
```json
{
  "token": "activation_token_here"
}
```

**Response**:
```json
{
  "email": "employee@example.com",
  "message": "Token is valid"
}
```

### `POST /auth/activate`
**Purpose**: Activate account with password and return JWT token

**Request**:
```json
{
  "token": "activation_token_here",
  "password": "new_password_here"
}
```

**Response**:
```json
{
  "token": "jwt_token_here",
  "message": "Account activated successfully",
  "employee": {
    "id": 123,
    "email": "employee@example.com",
    "name": "Employee Name",
    "status": "active"
  }
}
```

## 🎨 Frontend Implementation

### ActivatePage.jsx Features

1. **Auto URL Parameter Extraction**
   ```javascript
   const tokenFromUrl = searchParams.get("token");
   if (tokenFromUrl) {
     setForm(prev => ({ ...prev, token: tokenFromUrl }));
     handleTokenSubmit(tokenFromUrl);
   }
   ```

2. **Two-Step Process**
   - **Step 1**: Token validation (shows email)
   - **Step 2**: Password setup (read-only email, password fields)

3. **Professional UI**
   - Beautiful gradient design
   - Loading states
   - Error handling
   - Success messages

4. **Auto-Login**
   ```javascript
   localStorage.setItem("token", response.data.token);
   setTimeout(() => {
     navigate("/dashboard");
   }, 1500);
   ```

## 🧪 Testing

### Manual Testing
1. Create an employee via admin panel
2. Copy the activation URL from email (or database)
3. Open URL in browser: `http://localhost:5173/activate?token=abc123...`
4. Verify token auto-extraction
5. Click "Continue" to validate
6. Set password and activate
7. Verify auto-login and redirect

### Automated Testing
Run the integration test:
```bash
cd backend
node test-integration.js
```

## 📧 Email Integration

The system uses Brevo REST API for sending activation emails:

- **API Endpoint**: `https://api.brevo.com/v3/smtp/email`
- **Configuration**: Set `BREVO_SMTP_API_KEY` in `.env`
- **Email Template**: Professional HTML with activation button

## 🔒 Security Features

1. **Token Validation**: Only pending employees can activate
2. **Password Requirements**: Minimum 6 characters
3. **Password Confirmation**: Must match
4. **Auto-Cleanup**: Activation token cleared after use
5. **JWT Authentication**: Secure login after activation

## 🚀 Deployment Checklist

- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] Database connected and migrated
- [ ] Brevo API key configured
- [ ] Email templates tested
- [ ] Activation flow tested end-to-end

## 🐛 Troubleshooting

### Common Issues

1. **"Token not found"**
   - Check if employee exists in database
   - Verify token hasn't expired
   - Ensure employee status is 'pending'

2. **"Invalid token"**
   - Token may have been used already
   - Check token format in URL
   - Verify database connection

3. **"Email sending failed"**
   - Check Brevo API key configuration
   - Verify email template format
   - Check network connectivity

### Debug Steps

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check database for employee records
4. Test email configuration
5. Verify JWT token generation

## 📱 User Experience

### Expected User Journey

1. **Receive Email**: User gets activation email with link
2. **Click Link**: Opens activation page with pre-filled token
3. **Validate Token**: System shows user's email
4. **Set Password**: User creates secure password
5. **Auto-Login**: User automatically logged in
6. **Redirect**: User taken to dashboard

### UI/UX Features

- ✅ Responsive design
- ✅ Loading indicators
- ✅ Error messages
- ✅ Success feedback
- ✅ Auto-redirect
- ✅ Professional styling

## 🔄 Future Enhancements

1. **Token Expiration**: Add time-based token expiration
2. **Password Strength**: Enhanced password requirements
3. **Email Verification**: Double verification process
4. **Audit Logging**: Track activation attempts
5. **Rate Limiting**: Prevent brute force attacks

---

**Status**: ✅ Fully Integrated and Tested
**Last Updated**: December 2024 